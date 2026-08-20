#!/bin/bash

# 开发环境管理脚本
# 用法: ./dev-env.sh start|status|stop|restart|logs project_id

# 配置
BASE_PORT=4001
LOG_DIR="./logs"
PID_DIR="./pids"
TIMEOUT_MINUTES=15
PUBLIC_IP="localhost"

# 确保目录存在
mkdir -p "$LOG_DIR" "$PID_DIR"

# 获取可用端口
get_available_port() {
    local port=$BASE_PORT

    # 检查端口是否被占用 - 兼容macOS和Linux
    check_port_in_use() {
        local port_to_check=$1

        # 对于macOS，使用lsof命令
        if [[ "$(uname)" == "Darwin" ]]; then
            lsof -i :$port_to_check >/dev/null 2>&1
            return $?
        # 对于Linux，使用netstat命令
        else
            netstat -tuln | grep -q ":$port_to_check"
            return $?
        fi
    }

    # 查找可用端口
    while check_port_in_use $port; do
        echo "端口 $port 已被占用，尝试下一个端口..." >&2
        port=$((port + 1))
    done

    echo $port
}

# 添加日志时间戳
log_with_timestamp() {
    local message="$1"
    local log_file="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" >> "$log_file"
}

# 启动开发环境
start_env() {
    local project_id=$1
    local dev_mode=false

    # 检查是否有--dev参数
    if [[ "$2" == "--dev" ]]; then
        dev_mode=true
        echo "开发模式已启用，不会自动关闭进程"
    fi

    if [ -z "$project_id" ]; then
        echo "错误: 缺少项目ID"
        echo "用法: ./dev-env.sh start project_id"
        exit 1
    fi

    # 检查是否已经有该项目的环境在运行
    if [ -f "$PID_DIR/$project_id.pid" ]; then
        local pid=$(cat "$PID_DIR/$project_id.pid")
        if ps -p "$pid" > /dev/null; then
            echo "项目 $project_id 的开发环境已经在运行中"
            echo "PID: $pid"

            # 获取项目的端口和日志文件
            local log_file="$LOG_DIR/$project_id.log"
            local port=$(grep -o 'NEXT_PUBLIC_DOMAIN="http://localhost:[0-9]*"' .env.local 2>/dev/null | grep -o '[0-9]*')

            if [ -n "$port" ]; then
                echo "本地访问地址: http://localhost:$port"
                echo "公网访问地址: http://$PUBLIC_IP:$port"
            fi

            echo "日志文件: $log_file"

            # 询问是否要查看日志
            echo ""
            echo "显示日志 (按Ctrl+C退出日志查看)..."
            echo "-------------------------日志开始-------------------------"

            # 直接显示日志
            if [ -f "$log_file" ]; then
                tail -f "$log_file"
            else
                echo "找不到日志文件: $log_file"
            fi

            exit 0
        fi
    fi

    # 获取可用端口
    local port=$(get_available_port)
    local log_file="$LOG_DIR/$project_id.log"
    local pid_file="$PID_DIR/$project_id.pid"

    # 创建新的日志文件，添加开始标记
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ========== 开始新的开发环境会话 ==========" > "$log_file"
    log_with_timestamp "项目ID: $project_id" "$log_file"
    log_with_timestamp "端口: $port" "$log_file"

    # 创建环境变量文件
    cat > .env.local << EOL
# API配置
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/gateway

# 当前网站的域名，用于生成一些url路径使用
NEXT_PUBLIC_DOMAIN="http://localhost:$port"

# 项目ID
NEXT_PUBLIC_PROJECT_ID="$project_id"
EOL

    echo "正在启动项目 $project_id 的开发环境..."
    echo "端口: $port"

    # 启动开发服务器，使用tee命令同时输出到控制台和日志文件
    if command -v bun &> /dev/null; then
        # 创建一个包装脚本，添加时间戳
        cat > "$PID_DIR/$project_id.wrapper.sh" << 'WRAPPER'
#!/bin/bash
# 获取脚本参数
PORT=$1
LOG_FILE=$2

# 运行命令并添加时间戳
while IFS= read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line" >> "$LOG_FILE"
done < <(bun run dev --port $PORT 2>&1)
WRAPPER
        chmod +x "$PID_DIR/$project_id.wrapper.sh"

        # 使用包装脚本启动服务
        nohup "$PID_DIR/$project_id.wrapper.sh" $port "$log_file" &
    else
        # 创建一个包装脚本，添加时间戳
        cat > "$PID_DIR/$project_id.wrapper.sh" << 'WRAPPER'
#!/bin/bash
# 获取脚本参数
PORT=$1
LOG_FILE=$2

# 运行命令并添加时间戳
while IFS= read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line" >> "$LOG_FILE"
done < <(npm run dev -- --port $PORT 2>&1)
WRAPPER
        chmod +x "$PID_DIR/$project_id.wrapper.sh"

        # 使用包装脚本启动服务
        nohup "$PID_DIR/$project_id.wrapper.sh" $port "$log_file" &
    fi

    # 保存进程ID
    echo $! > "$pid_file"
    log_with_timestamp "启动进程ID: $!" "$log_file"

    # 等待服务器启动
    echo "等待服务器启动..."
    sleep 5

    # 检查服务器是否正在运行
    if ps -p $(cat "$pid_file") > /dev/null; then
        echo "服务器启动成功"
        echo "PID: $(cat "$pid_file")"
        echo "本地访问地址: http://localhost:$port"
        echo "公网访问地址: http://$PUBLIC_IP:$port"
        echo "日志文件: $log_file"

        log_with_timestamp "服务器启动成功" "$log_file"
        log_with_timestamp "本地访问地址: http://localhost:$port" "$log_file"
        log_with_timestamp "公网访问地址: http://$PUBLIC_IP:$port" "$log_file"

        # 只有在非开发模式下才设置自动关闭
        if [ "$dev_mode" = false ]; then
            # 设置自动关闭
            (
                log_with_timestamp "设置自动关闭计时器: $TIMEOUT_MINUTES 分钟" "$log_file"

                # 等待指定时间
                sleep $(($TIMEOUT_MINUTES * 60))

                if [ -f "$pid_file" ]; then
                    local shutdown_pid=$(cat "$pid_file")
                    log_with_timestamp "自动关闭时间到达，准备关闭进程 $shutdown_pid" "$log_file"

                    # 获取所有子进程
                    local child_pids=$(pgrep -P $shutdown_pid)

                    if ps -p "$shutdown_pid" > /dev/null; then
                        log_with_timestamp "正在关闭主进程 $shutdown_pid" "$log_file"
                        kill "$shutdown_pid"
                        sleep 2

                        # 检查进程是否仍在运行，如果是则强制终止
                        if ps -p "$shutdown_pid" > /dev/null; then
                            log_with_timestamp "进程未响应，强制终止 $shutdown_pid" "$log_file"
                            kill -9 "$shutdown_pid"
                        fi

                        # 关闭所有子进程
                        for child_pid in $child_pids; do
                            if ps -p "$child_pid" > /dev/null; then
                                log_with_timestamp "正在关闭子进程 $child_pid" "$log_file"
                                kill "$child_pid"
                                sleep 1
                                if ps -p "$child_pid" > /dev/null; then
                                    log_with_timestamp "子进程未响应，强制终止 $child_pid" "$log_file"
                                    kill -9 "$child_pid"
                                fi
                            fi
                        done

                        log_with_timestamp "所有进程已终止" "$log_file"
                    else
                        log_with_timestamp "进程 $shutdown_pid 已不存在" "$log_file"
                    fi

                    # 清理临时文件
                    rm -f "$pid_file" "$PID_DIR/$project_id.wrapper.sh"
                    log_with_timestamp "已清理临时文件" "$log_file"
                    log_with_timestamp "========== 会话结束 ==========" "$log_file"
                fi
            ) &

            echo "环境将在 $TIMEOUT_MINUTES 分钟后自动关闭"
        else
            log_with_timestamp "开发模式已启用，不会自动关闭进程" "$log_file"
            echo "开发模式已启用，进程不会自动关闭"
        fi

        # 直接显示日志
        echo ""
        echo "显示日志 (按Ctrl+C退出日志查看)..."
        echo "-------------------------日志开始-------------------------"

        # 使用tail -f直接显示日志
        # 这会阻塞脚本，但这正是我们想要的行为
        tail -f "$log_file"
    else
        echo "服务器启动失败"
        echo "查看日志: $log_file"
        log_with_timestamp "服务器启动失败" "$log_file"
        # 清理临时文件
        rm -f "$PID_DIR/$project_id.wrapper.sh"
        exit 1
    fi
}

# 查看环境状态
status_env() {
    local project_id=$1

    if [ -z "$project_id" ]; then
        echo "所有开发环境状态:"
        for pid_file in "$PID_DIR"/*.pid; do
            if [ -f "$pid_file" ]; then
                local proj_id=$(basename "$pid_file" .pid)
                local pid=$(cat "$pid_file")
                if ps -p "$pid" > /dev/null; then
                    echo "项目: $proj_id - 运行中 (PID: $pid)"
                else
                    echo "项目: $proj_id - 已停止 (PID: $pid)"
                    rm "$pid_file"
                fi
            fi
        done

        if [ ! "$(ls -A "$PID_DIR")" ]; then
            echo "没有运行中的开发环境"
        fi
    else
        local pid_file="$PID_DIR/$project_id.pid"
        local log_file="$LOG_DIR/$project_id.log"

        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if ps -p "$pid" > /dev/null; then
                local port=$(grep -o 'NEXT_PUBLIC_DOMAIN="http://localhost:[0-9]*"' .env.local | grep -o '[0-9]*')
                echo "项目: $project_id"
                echo "状态: 运行中"
                echo "PID: $pid"
                echo "日志文件: $log_file"
                echo "本地访问地址: http://localhost:$port"
                echo "公网访问地址: http://$PUBLIC_IP:$port"
            else
                echo "项目: $project_id"
                echo "状态: 已停止"
                rm "$pid_file"
            fi
        else
            echo "项目 $project_id 的开发环境未运行"
        fi
    fi
}

# 停止环境
stop_env() {
    local project_id=$1

    if [ -z "$project_id" ]; then
        echo "错误: 缺少项目ID"
        echo "用法: ./dev-env.sh stop project_id"
        exit 1
    fi

    local pid_file="$PID_DIR/$project_id.pid"
    local log_file="$LOG_DIR/$project_id.log"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")

        # 检查日志文件是否存在，如果不存在则创建
        if [ ! -f "$log_file" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ========== 开始新的日志 ==========" > "$log_file"
        fi

        log_with_timestamp "手动停止项目 $project_id 的开发环境" "$log_file"

        if ps -p "$pid" > /dev/null; then
            echo "正在停止项目 $project_id 的开发环境..."
            log_with_timestamp "正在停止主进程 $pid" "$log_file"

            # 获取所有子进程
            local child_pids=$(pgrep -P $pid)

            # 停止主进程
            kill "$pid"
            sleep 2
            if ps -p "$pid" > /dev/null; then
                echo "进程未响应，强制终止..."
                log_with_timestamp "主进程未响应，强制终止 $pid" "$log_file"
                kill -9 "$pid"
            fi

            # 停止所有子进程
            for child_pid in $child_pids; do
                if ps -p "$child_pid" > /dev/null; then
                    log_with_timestamp "正在停止子进程 $child_pid" "$log_file"
                    kill "$child_pid"
                    sleep 1
                    if ps -p "$child_pid" > /dev/null; then
                        log_with_timestamp "子进程未响应，强制终止 $child_pid" "$log_file"
                        kill -9 "$child_pid"
                    fi
                fi
            done

            echo "开发环境已停止"
            log_with_timestamp "所有进程已终止" "$log_file"
        else
            echo "项目 $project_id 的开发环境未运行"
            log_with_timestamp "进程 $pid 已不存在" "$log_file"
        fi

        # 清理临时文件
        rm -f "$pid_file" "$PID_DIR/$project_id.wrapper.sh"
        log_with_timestamp "已清理临时文件" "$log_file"
        log_with_timestamp "========== 会话结束 ==========" "$log_file"
    else
        echo "项目 $project_id 的开发环境未运行"
    fi
}

# 停止项目的所有运行实例
stop_all_for_project() {
    local project_id=$1
    local log_file="$LOG_DIR/stopall.log"

    # 创建日志文件
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ========== 开始停止所有实例 ==========" > "$log_file"

    if [ -n "$project_id" ]; then
        # 如果提供了项目ID，只停止该项目的实例
        log_with_timestamp "停止项目 $project_id 的所有运行实例" "$log_file"
        echo "查找项目 $project_id 的所有运行实例..."

        # 查找所有包含该项目ID的进程
        local pids=$(ps aux | grep "NEXT_PUBLIC_PROJECT_ID=\"$project_id\"" | grep -v grep | awk '{print $2}')

        if [ -z "$pids" ]; then
            echo "未找到项目 $project_id 的运行实例"
            log_with_timestamp "未找到项目 $project_id 的运行实例" "$log_file"

            # 尝试通过PID文件查找
            if [ -f "$PID_DIR/$project_id.pid" ]; then
                local pid=$(cat "$PID_DIR/$project_id.pid")
                if ps -p "$pid" > /dev/null; then
                    pids="$pid"
                    echo "通过PID文件找到进程: $pid"
                    log_with_timestamp "通过PID文件找到进程: $pid" "$log_file"
                else
                    echo "PID文件中的进程 $pid 已不存在，清理PID文件"
                    log_with_timestamp "PID文件中的进程 $pid 已不存在，清理PID文件" "$log_file"
                    rm -f "$PID_DIR/$project_id.pid"
                    rm -f "$PID_DIR/$project_id.wrapper.sh"
                fi
            fi

            if [ -z "$pids" ]; then
                return
            fi
        fi
    else
        # 如果没有提供项目ID，停止所有开发环境实例
        log_with_timestamp "停止所有开发环境实例" "$log_file"
        echo "查找所有开发环境实例..."

        # 查找所有可能的开发环境进程
        # 1. 查找监听端口范围内的Node.js进程
        local port_range_start=$BASE_PORT
        local first_available_port=""

        echo "查找监听端口，从 $port_range_start 开始..."
        log_with_timestamp "查找监听端口，从 $port_range_start 开始..." "$log_file"

        # 使用lsof查找监听指定端口范围的进程
        local pids=""
        local port=$port_range_start

        # 检查端口是否被占用的函数
        check_port_in_use() {
            local port_to_check=$1

            # 对于macOS，使用lsof命令
            if [[ "$(uname)" == "Darwin" ]]; then
                lsof -i :$port_to_check >/dev/null 2>&1
                # lsof返回0表示找到了进程，即端口被占用
                if [ $? -eq 0 ]; then
                    return 0  # 端口被占用
                else
                    return 1  # 端口未被占用
                fi
            # 对于Linux，使用netstat命令
            else
                netstat -tuln | grep -q ":$port_to_check"
                # grep返回0表示找到了匹配，即端口被占用
                if [ $? -eq 0 ]; then
                    return 0  # 端口被占用
                else
                    return 1  # 端口未被占用
                fi
            fi
        }

        # 查找所有已占用的端口，直到找到第一个未占用的端口
        while true; do
            if check_port_in_use $port; then
                # 端口被占用，查找进程
                local port_pids=$(lsof -i :$port -t 2>/dev/null)
                for port_pid in $port_pids; do
                    # 检查是否是Node.js或Bun进程
                    local cmd=$(ps -p $port_pid -o command= 2>/dev/null | grep -E 'node|bun|next')
                    if [ -n "$cmd" ]; then
                        pids="$pids $port_pid"
                        echo "找到端口 $port 上的进程: $port_pid - $cmd"
                        log_with_timestamp "找到端口 $port 上的进程: $port_pid - $cmd" "$log_file"
                    fi
                done
                # 检查下一个端口
                port=$((port + 1))
            else
                # 找到第一个未占用的端口，停止查找
                first_available_port=$port
                printf "找到第一个未占用的端口: %d，停止查找\n" "$first_available_port"
                log_with_timestamp "找到第一个未占用的端口: $first_available_port，停止查找" "$log_file"
                break
            fi

            # 设置一个上限，避免无限循环
            if [ $port -gt 5000 ]; then
                echo "已检查到端口5000，停止查找"
                log_with_timestamp "已检查到端口5000，停止查找" "$log_file"
                break
            fi
        done

        # 2. 查找所有PID文件中的进程
        for pid_file in "$PID_DIR"/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                if ps -p "$pid" > /dev/null; then
                    pids="$pids $pid"
                    local proj_id=$(basename "$pid_file" .pid)
                    echo "通过PID文件找到项目 $proj_id 的进程: $pid"
                    log_with_timestamp "通过PID文件找到项目 $proj_id 的进程: $pid" "$log_file"
                else
                    local proj_id=$(basename "$pid_file" .pid)
                    echo "PID文件中的进程已不存在，清理PID文件: $pid_file"
                    log_with_timestamp "PID文件中的进程已不存在，清理PID文件: $pid_file" "$log_file"
                    rm -f "$pid_file"
                    rm -f "$PID_DIR/$proj_id.wrapper.sh"
                fi
            fi
        done

        # 去重
        pids=$(echo $pids | tr ' ' '\n' | sort -u | tr '\n' ' ')

        if [ -z "$pids" ]; then
            echo "未找到任何开发环境实例"
            log_with_timestamp "未找到任何开发环境实例" "$log_file"
            return
        fi
    fi

    # 处理找到的进程
    echo "找到以下进程:"
    log_with_timestamp "找到以下进程:" "$log_file"
    for pid in $pids; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null | head -c 50)
        echo "PID: $pid - $cmd..."
        log_with_timestamp "PID: $pid - $cmd..." "$log_file"
    done

    echo "正在停止所有进程..."
    log_with_timestamp "正在停止所有进程..." "$log_file"

    for pid in $pids; do
        echo "停止进程 $pid..."
        log_with_timestamp "停止进程 $pid..." "$log_file"

        # 获取所有子进程
        local child_pids=$(pgrep -P $pid 2>/dev/null)

        # 停止主进程
        kill $pid 2>/dev/null
        sleep 1
        if ps -p $pid > /dev/null 2>&1; then
            echo "进程未响应，强制终止..."
            log_with_timestamp "进程未响应，强制终止 $pid" "$log_file"
            kill -9 $pid 2>/dev/null
        fi

        # 停止所有子进程
        for child_pid in $child_pids; do
            if ps -p "$child_pid" > /dev/null 2>&1; then
                log_with_timestamp "正在停止子进程 $child_pid" "$log_file"
                kill "$child_pid" 2>/dev/null
                sleep 1
                if ps -p "$child_pid" > /dev/null 2>&1; then
                    log_with_timestamp "子进程未响应，强制终止 $child_pid" "$log_file"
                    kill -9 "$child_pid" 2>/dev/null
                fi
            fi
        done
    done

    # 清理所有PID文件
    echo "清理所有PID文件和包装脚本..."
    log_with_timestamp "清理所有PID文件和包装脚本..." "$log_file"

    for pid_file in "$PID_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            echo "删除PID文件: $pid_file"
            log_with_timestamp "删除PID文件: $pid_file" "$log_file"
            rm -f "$pid_file"
        fi
    done

    # 清理所有包装脚本
    for wrapper_file in "$PID_DIR"/*.wrapper.sh; do
        if [ -f "$wrapper_file" ]; then
            echo "删除包装脚本: $wrapper_file"
            log_with_timestamp "删除包装脚本: $wrapper_file" "$log_file"
            rm -f "$wrapper_file"
        fi
    done

    if [ -n "$project_id" ]; then
        echo "项目 $project_id 的所有实例已停止"
        log_with_timestamp "项目 $project_id 的所有实例已停止" "$log_file"
    else
        echo "所有开发环境实例已停止"
        log_with_timestamp "所有开发环境实例已停止" "$log_file"
    fi

    log_with_timestamp "========== 停止操作完成 ==========" "$log_file"
}

# 重启环境
restart_env() {
    local project_id=$1
    local dev_flag=$2

    if [ -z "$project_id" ]; then
        echo "错误: 缺少项目ID"
        echo "用法: ./dev-env.sh restart project_id [--dev]"
        exit 1
    fi

    local pid_file="$PID_DIR/$project_id.pid"
    local log_file="$LOG_DIR/$project_id.log"

    # 检查环境是否在运行
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null; then
            echo "正在重启项目 $project_id 的开发环境..."
            log_with_timestamp "正在重启项目 $project_id 的开发环境" "$log_file"

            # 先停止环境
            stop_env "$project_id"

            # 等待一下确保所有进程都已停止
            sleep 2

            # 然后启动环境，传递开发模式参数
            start_env "$project_id" "$dev_flag"
        else
            echo "项目 $project_id 的开发环境未运行，直接启动..."
            log_with_timestamp "项目 $project_id 的开发环境未运行，直接启动" "$log_file"

            # 清理可能存在的过期PID文件
            rm -f "$pid_file" "$PID_DIR/$project_id.wrapper.sh"

            # 启动环境，传递开发模式参数
            start_env "$project_id" "$dev_flag"
        fi
    else
        echo "项目 $project_id 的开发环境未运行，直接启动..."
        log_with_timestamp "项目 $project_id 的开发环境未运行，直接启动" "$log_file"

        # 启动环境，传递开发模式参数
        start_env "$project_id" "$dev_flag"
    fi
}

# 查看日志
view_logs() {
    local project_id=$1

    if [ -z "$project_id" ]; then
        echo "错误: 缺少项目ID"
        echo "用法: ./dev-env.sh logs project_id"
        exit 1
    fi

    local log_file="$LOG_DIR/$project_id.log"

    if [ -f "$log_file" ]; then
        tail -f "$log_file"
    else
        echo "项目 $project_id 的日志文件不存在"
    fi
}

# 主函数
main() {
    local command=$1
    local project_id=$2
    local dev_flag=$3

    case "$command" in
        start)
            if [ -z "$project_id" ]; then
                echo "错误: 缺少项目ID"
                echo "用法: ./dev-env.sh start project_id [--dev]"
                echo "  --dev: 开发模式，不会自动关闭进程"
                exit 1
            fi
            start_env "$project_id" "$dev_flag"
            ;;
        status)
            status_env "$project_id"
            ;;
        stop)
            if [ -z "$project_id" ]; then
                echo "错误: 缺少项目ID"
                echo "用法: ./dev-env.sh stop project_id"
                exit 1
            fi
            stop_env "$project_id"
            ;;
        restart)
            if [ -z "$project_id" ]; then
                echo "错误: 缺少项目ID"
                echo "用法: ./dev-env.sh restart project_id [--dev]"
                echo "  --dev: 开发模式，不会自动关闭进程"
                exit 1
            fi
            restart_env "$project_id" "$dev_flag"
            ;;
        stopall)
            # stopall命令可以不带项目ID，此时停止所有开发环境
            stop_all_for_project "$project_id"
            ;;
        logs)
            if [ -z "$project_id" ]; then
                echo "错误: 缺少项目ID"
                echo "用法: ./dev-env.sh logs project_id"
                exit 1
            fi
            view_logs "$project_id"
            ;;
        *)
            echo "用法: ./dev-env.sh start|status|stop|restart|stopall|logs [project_id] [--dev]"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动指定项目ID的开发环境"
            echo "  status  - 查看所有或指定项目ID的开发环境状态"
            echo "  stop    - 停止指定项目ID的开发环境"
            echo "  restart - 重启指定项目ID的开发环境"
            echo "  stopall - 停止所有开发环境实例，可选提供项目ID"
            echo "  logs    - 查看指定项目ID的日志"
            echo ""
            echo "参数说明:"
            echo "  --dev   - 开发模式，不会自动关闭进程（仅适用于start和restart命令）"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
