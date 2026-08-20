<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" indent="yes" />
  
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            color: #1e293b;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2rem;
            font-weight: 700;
          }
          .summary {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .summary h2 {
            margin: 0 0 15px 0;
            color: #475569;
            font-size: 1.2rem;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #3b82f6;
          }
          .stat-label {
            color: #64748b;
            font-size: 0.9rem;
          }
          .url-list {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .url-item {
            border-bottom: 1px solid #e2e8f0;
            padding: 15px 20px;
            transition: background-color 0.2s;
          }
          .url-item:hover {
            background-color: #f1f5f9;
          }
          .url-item:last-child {
            border-bottom: none;
          }
          .url-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }
          .url-link:hover {
            text-decoration: underline;
          }
          .url-info {
            display: flex;
            gap: 20px;
            margin-top: 8px;
            font-size: 0.85rem;
            color: #64748b;
          }
          .url-info span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .priority {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          .priority-high {
            background-color: #fef3c7;
            color: #92400e;
          }
          .priority-medium {
            background-color: #dbeafe;
            color: #1d4ed8;
          }
          .priority-low {
            background-color: #e0e7ff;
            color: #3730a3;
          }
          .alternates {
            margin-top: 8px;
          }
          .alternate-link {
            display: inline-block;
            margin: 2px 5px 2px 0;
            padding: 2px 6px;
            background-color: #e5e7eb;
            color: #374151;
            text-decoration: none;
            font-size: 0.75rem;
            border-radius: 4px;
            font-family: monospace;
          }
          .alternate-link:hover {
            background-color: #d1d5db;
          }
          @media (max-width: 768px) {
            .stats {
              gap: 20px;
            }
            .url-info {
              flex-direction: column;
              gap: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sitemap</h1>
          
          <div class="summary">
            <h2>Site Statistics</h2>
            <div class="stats">
              <div class="stat">
                <div class="stat-number">
                  <xsl:value-of select="count(//sitemap:url)" />
                </div>
                <div class="stat-label">Total Pages</div>
              </div>
              <div class="stat">
                <div class="stat-number">
                  <xsl:value-of select="count(//sitemap:url[sitemap:priority >= 0.8])" />
                </div>
                <div class="stat-label">High Priority Pages</div>
              </div>
              <div class="stat">
                <div class="stat-number">
                  <xsl:value-of select="count(//xhtml:link)" />
                </div>
                <div class="stat-label">Alternate Language Links</div>
              </div>
            </div>
          </div>

          <div class="url-list">
            <xsl:for-each select="//sitemap:url">
              <xsl:sort select="sitemap:priority" order="descending" />
              <xsl:sort select="sitemap:loc" />
              <div class="url-item">
                <a class="url-link" href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc" />
                </a>
                
                <div class="url-info">
                  <span>
                    📊 Priority: 
                    <span class="priority">
                      <xsl:attribute name="class">
                        <xsl:choose>
                          <xsl:when test="sitemap:priority >= 0.8">priority priority-high</xsl:when>
                          <xsl:when test="sitemap:priority >= 0.6">priority priority-medium</xsl:when>
                          <xsl:otherwise>priority priority-low</xsl:otherwise>
                        </xsl:choose>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:priority" />
                    </span>
                  </span>
                  
                  <span>
                    🔄 Change Frequency: <xsl:value-of select="sitemap:changefreq" />
                  </span>
                  
                  <span>
                    📅 Last Modified: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)" />
                  </span>
                </div>

                <xsl:if test="xhtml:link">
                  <div class="alternates">
                    <strong>🌐 Alternate Languages:</strong>
                    <xsl:for-each select="xhtml:link">
                      <a class="alternate-link" href="{@href}">
                        <xsl:value-of select="@hreflang" />
                      </a>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>