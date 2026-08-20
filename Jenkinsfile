pipeline {
    agent any

    // 定义环境变量
    environment {
        // 项目ID和部署记录ID，从参数中获取
        PROJECT_ID = "${params.project_id}"
        PROJECT_DOMAIN = "${params.project_domain}"
        DEPLOYMENT_ID = "${params.deployment_id}"
        WEB_API_URL = "${params.web_api_url}"
        DEFAULT_LOCALE = "${params.default_locale}"

        // 回调URL和令牌，用于更新部署状态
        CALLBACK_URL = "${params.callback_url}"
        CALLBACK_TOKEN = "${params.callback_token}"

        // 服务器信息，从参数中获取（使用小写参数名，与JenkinsService中保持一致）
        SERVER_IP = "${params.server_ip}"
        SSH_USERNAME = "${params.ssh_username}"
        SSH_PASSWORD = "${params.ssh_password}"
        SSH_PRIVATE_KEY = "${params.ssh_private_key}"
        FTP_PATH = "${params.ftp_path}"

        // 构建信息
        BUILD_DIR = "out"
        ARCHIVE_NAME = "dist.zip"
    }

     parameters {
        string(name: 'project_id', defaultValue: 'project123', description: '项目ID，用于查询数据')
        string(name: 'project_domain', defaultValue: 'project123.qizhilu.com', description: '项目域名')
        string(name: 'deployment_id', defaultValue: 'deployment123', description: '部署ID，用于更新部署状态')
        string(name: 'callback_url', defaultValue: 'https://api.qizhilu.com/api/callback', description: '回调URL')
        string(name: 'callback_token', defaultValue: 'qizhilu_callback_token', description: '回调令牌')
        string(name: 'server_ip', defaultValue: '127.0.0.1', description: '服务器IP')
        string(name: 'ssh_username', defaultValue: 'root', description: 'SSH用户名')
        string(name: 'ssh_password', defaultValue: 'password', description: 'SSH密码')
        string(name: 'ssh_private_key', defaultValue: 'private_key', description: 'SSH私钥')
        string(name: 'ftp_path', defaultValue: '/var/www/html', description: 'FTP路径')
        string(name: 'api_url', defaultValue: 'https://qizhilu.com/api/gateway', description: 'API接口地址')
        string(name: 'default_locale', defaultValue: 'en', description: '默认语言')
    }

    stages {
        // 初始化阶段：发送开始构建的回调
        stage('Initialize') {
            steps {
                echo "Starting build for Project ID: ${PROJECT_ID}, Deployment ID: ${DEPLOYMENT_ID}"

                // 发送构建开始的回调
                script {
                    def startPayload = """
                    {
                        "deploymentId": "${DEPLOYMENT_ID}",
                        "status": "STARTED",
                        "buildNumber": ${BUILD_NUMBER},
                        "buildUrl": "${BUILD_URL}",
                        "message": "Jenkins构建已开始"
                    }
                    """

                    if (CALLBACK_URL) {
                        sh """
                        curl -X POST "${CALLBACK_URL}" \\
                            -H "Content-Type: application/json" \\
                            -H "Authorization: Bearer ${CALLBACK_TOKEN}" \\
                            -d '${startPayload}'
                        """
                    } else {
                        echo "No callback URL provided, skipping callback"
                    }
                }
            }
        }

        // 检查Bun阶段
        stage('Check Bun') {
            steps {
                echo "Checking if Bun is installed for jenkins user..."
                sh '''
                # 检查jenkins用户目录下的bun是否可用
                echo "HOME: $HOME"
                if [ -f "$HOME/.bun/bin/bun" ]; then
                    echo "Bun is available for jenkins user:"
                    $HOME/.bun/bin/bun --version
                else
                    echo "Bun not found in jenkins user directory."
                    echo "Please run the following commands on the host machine:"
                    echo "sudo su - jenkins"
                    echo "curl -fsSL https://bun.sh/install | bash"
                    echo "exit"
                    exit 1
                fi
                '''
            }
        }


        // 安装依赖阶段
        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies with Bun..."
                sh '''
                # 使用jenkins用户目录下的bun
                $HOME/.bun/bin/bun install
                '''
            }
        }

        // 构建项目阶段
        stage('Build') {
            steps {
                echo "Building project with Bun..."
                // 使用jenkins用户目录下的bun
                sh """
                # 设置环境变量(替换.env.production)
                export NEXT_PUBLIC_PROJECT_ID=${PROJECT_ID}
                export NEXT_PUBLIC_PROJECT_DOMAIN=${PROJECT_DOMAIN}
                export NEXT_PUBLIC_WEB_API_URL=${WEB_API_URL}
                export NEXT_PUBLIC_DEFAULT_LOCALE=${DEFAULT_LOCALE}
                # 使用jenkins用户目录下的bun
                ${HOME}/.bun/bin/bun run scripts/fetch-site-settings.ts
                ${HOME}/.bun/bin/bun run build
                """
                // 检查构建结果
                sh "ls -la ${BUILD_DIR}"
            }
        }

        // 打包构建结果
        stage('Package') {
            steps {
                echo "Packaging build artifacts..."
                sh "cd ${BUILD_DIR} && zip -r ../${ARCHIVE_NAME} . -q"
                sh "ls -la ${ARCHIVE_NAME}"
            }
        }

        // 部署到服务器
        stage('Deploy') {
            steps {
                echo "Deploying to server ${SERVER_IP}..."
                echo "Using FTP path: ${FTP_PATH}"

                script {
                    // 根据提供的认证方式选择部署方法
                    if (SSH_PRIVATE_KEY != "no") {
                        // 使用SSH私钥认证
                        withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'KEY_FILE', usernameVariable: 'USERNAME')]) {
                            // 创建临时SSH私钥文件
                            sh """
                            echo "${SSH_PRIVATE_KEY}" > ssh_key.pem
                            chmod 600 ssh_key.pem

                            # 创建目标目录（如果不存在）
                            ssh -o StrictHostKeyChecking=no -i ssh_key.pem ${SSH_USERNAME}@${SERVER_IP} "mkdir -p ${FTP_PATH}"

                            # 上传构建包
                            scp -o StrictHostKeyChecking=no -i ssh_key.pem ${ARCHIVE_NAME} ${SSH_USERNAME}@${SERVER_IP}:${FTP_PATH}/

                            # 解压文件
                            ssh -o StrictHostKeyChecking=no -i ssh_key.pem ${SSH_USERNAME}@${SERVER_IP} "cd ${FTP_PATH} && unzip -o ${ARCHIVE_NAME}"

                            # 清理
                            rm -f ssh_key.pem
                            """
                        }
                    } else if (SSH_PASSWORD) {
                        // 使用密码认证
                        // 安装sshpass（如果需要）
                        // sh "which sshpass || apt-get update && apt-get install -y sshpass"

                        sh """
                        set +x
                        # 创建目标目录（如果不存在）
                        sshpass -p "${SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SSH_USERNAME}@${SERVER_IP} "mkdir -p ${FTP_PATH}"

                        # 上传构建包
                        sshpass -p "${SSH_PASSWORD}" scp -o StrictHostKeyChecking=no ${ARCHIVE_NAME} ${SSH_USERNAME}@${SERVER_IP}:${FTP_PATH}/

                        # 解压文件
                        sshpass -p "${SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SSH_USERNAME}@${SERVER_IP} "cd ${FTP_PATH} && unzip -q -o ${ARCHIVE_NAME}"
                        set -x
                        """
                    } else {
                        error "No SSH credentials provided"
                    }
                }

                echo "Deployment completed successfully"
            }
        }
    }

    // 构建后操作
    post {
        success {
            echo "Build and deployment successful!"

            // 发送成功回调
            script {
                def successPayload = """
                {
                    "deploymentId": "${DEPLOYMENT_ID}",
                    "status": "SUCCESS",
                    "buildNumber": ${BUILD_NUMBER},
                    "message": "Jenkins构建和部署成功"
                }
                """

                if (CALLBACK_URL) {
                    sh """
                    curl -X POST "${CALLBACK_URL}" \\
                        -H "Content-Type: application/json" \\
                        -H "Authorization: Bearer ${CALLBACK_TOKEN}" \\
                        -d '${successPayload}'
                    """
                }
            }
        }

        failure {
            echo "Build or deployment failed!"

            // 发送失败回调
            script {
                def failurePayload = """
                {
                    "deploymentId": "${DEPLOYMENT_ID}",
                    "status": "FAILURE",
                    "buildNumber": ${BUILD_NUMBER},
                    "message": "Jenkins构建或部署失败"
                }
                """

                if (CALLBACK_URL) {
                    sh """
                    curl -X POST "${CALLBACK_URL}" \\
                        -H "Content-Type: application/json" \\
                        -H "Authorization: Bearer ${CALLBACK_TOKEN}" \\
                        -d '${failurePayload}'
                    """
                }
            }
        }

        aborted {
            echo "Build was aborted!"

            // 发送中止回调
            script {
                def abortedPayload = """
                {
                    "deploymentId": "${DEPLOYMENT_ID}",
                    "status": "ABORTED",
                    "buildNumber": ${BUILD_NUMBER},
                    "message": "Jenkins构建被中止"
                }
                """

                if (CALLBACK_URL) {
                    sh """
                    curl -X POST "${CALLBACK_URL}" \\
                        -H "Content-Type: application/json" \\
                        -H "Authorization: Bearer ${CALLBACK_TOKEN}" \\
                        -d '${abortedPayload}'
                    """
                }
            }
        }

        always {
            // 清理工作区
            cleanWs()
        }
    }
}
