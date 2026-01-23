/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */

/*
 * ============================================================================
 * SuiteQL Query Tool
 * ============================================================================
 *
 * A modern utility for running SuiteQL queries in NetSuite.
 *
 * Version: 2026.02
 *
 * License: MIT
 * Copyright (c) 2021-2026 Timothy Dietrich
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * ============================================================================
 * Developer
 * ============================================================================
 *
 * Tim Dietrich
 * - Email: timdietrich@me.com
 * - Web: https://timdietrich.me
 *
 * ============================================================================
 * History
 * ============================================================================
 *
 * 2026.02 - Budy Sutjijati
 * - Added multi-account remote SuiteQL execution support
 *   - Allows queries to be executed against configured external NetSuite accounts
 *   - Remote accounts defined via script parameter configuration
 *   - Unified execution path for local and remote queries
 * - Enhanced execution transparency with explicit Local vs Remote context
 *   - Displays execution origin in results metadata
 *   - Shows account description and account ID for each query run
 *   - Persists across view changes, history reloads, and keyboard execution
 * - Improved Run toolbar to support multi-target execution
 *   - Added Run dropdown for selecting execution account
 *   - Preserves existing Run behavior and keyboard shortcuts
 *
 * 2026.01 - Tim Dietrich
 * - Complete UI modernization with SQL Studio-inspired design
 * - Upgraded to Bootstrap 5.3 and removed jQuery dependency
 * - Added CodeMirror for SQL syntax highlighting
 * - Implemented dark mode support with theme persistence
 * - Added query history with localStorage persistence
 * - Modernized JavaScript (const/let, arrow functions, ES6+ features)
 * - Improved code organization and documentation
 * - Enhanced results table with sticky headers and better styling
 * - Added toast notifications replacing alert dialogs
 * - Improved responsive design
 * - Added view mode toggle (Table, DataTable, JSON)
 * - Added collapsible sidebar for query history
 * - Added Focus Mode to hide NetSuite chrome
 * - Added column statistics (SUM, AVG, MIN, MAX) for numeric columns
 * - Added query sharing via URL
 * - Added auto-save draft with localStorage persistence
 * - Added row details popup (click any row to view all fields)
 * - Added execution time tracking
 * - Added table/column autocomplete (Ctrl+Space)
 * - Added native Excel (.xlsx) export via SheetJS
 * - Added SQL file import with drag & drop support
 * - Added SQL file download/export (.sql)
 * - Added column reordering via drag & drop
 * - Added query parameters ({{variable}} syntax with prompt)
 * - Added keyboard shortcuts modal (press ? to view)
 * - Added visual undo/redo history panel
 * - Added column pinning (freeze first 1-3 columns while scrolling)
 * - Added results maximized mode (Shift+R to hide editor and maximize results)
 * - Added AI-powered query generation with natural language input
 *   - Supports both Anthropic (Claude) and OpenAI (GPT) APIs
 *   - Conversational interface with persistent chat history
 *   - Auto-detects SQL in responses with one-click insert
 *   - Optional auto-execute for generated queries
 *   - Configurable API key storage (session-only or persistent)
 * - Added AI-powered Tables Reference enhancements
 *   - "Ask AI about this table" with preset questions:
 *     - What is this table used for?
 *     - Show me a sample query
 *     - How to join with Customer table?
 *     - Most important columns?
 *     - Custom question chat
 *   - "Find the right table" natural language search:
 *     - Toggle between Standard and AI Find search modes
 *     - Describe data needs in plain English
 *     - AI suggests relevant tables with explanations
 *     - Clickable table names in AI responses
 *   - "Generate query from selection":
 *     - Column selection checkboxes in table detail view
 *     - Select All / Clear buttons
 *     - AI generates practical query with selected columns
 * - Added AI-powered editor features:
 *   - "Explain Query" button:
 *     - Breaks down complex queries into plain English
 *     - Explains tables, joins, filters, and purpose
 *   - "Validate Query" button:
 *     - AI reviews query before execution
 *     - Warns about missing WHERE, cartesian joins, SELECT *, etc.
 *     - Provides suggestions for improvements
 *   - Query optimization suggestions:
 *     - Automatically offers optimization for slow queries (>5s)
 *     - AI suggests indexes, better joins, restructuring
 *   - Natural language query bar:
 *     - Quick input above the editor
 *     - Type plain English like "Show me overdue invoices over $1000"
 *     - AI generates and inserts query directly
 * - Fixed Safari resizer bug (drag handle could not be released)
 * - Added confirmation dialog before clearing results
 * - Toolbar improvements:
 *   - Shortened "Run Query" to "Run"
 *   - Grouped AI features into dropdown (AI Chat, Quick Ask Bar, Explain, Validate)
 *   - Grouped file operations into "More" dropdown (Query Library, Share, Import, Download)
 *   - Consolidated right-side icon buttons (removed dividers)
 *   - Added compact mode toggle (icons only) in Options panel
 *   - Added individual toolbar visibility toggles (Format, AI, More, Tables)
 *   - Reduced button sizes for a cleaner, more compact toolbar
 * - Added editor font size selector (Extra Small to Extra Large: 10-16px)
 * - Improved SQL formatter to match preferred coding style:
 *   - Tab indentation
 *   - Keywords uppercase
 *   - Each SELECT column on its own line
 *   - JOIN conditions in parentheses with spaces
 *   - AND/OR at start of lines
 *   - Preserves comments
 * - Added "Force cache miss" option (Advanced):
 *   - Injects unique UUID condition to bypass Oracle query cache
 *   - Useful for benchmarking query performance
 *   - Shows "uncached" badge next to elapsed time when enabled
 *
 * ============================================================================
 */

// =============================================================================
// SECTION 1: CONFIGURATION
// =============================================================================

/**
 * Application configuration settings.
 * Modify these values to customize the tool's behavior.
 */
const CONFIG = Object.freeze({
    /** Application version */
    VERSION: '2026.02',

    /** Enable DataTables for enhanced table functionality */
    DATATABLES_ENABLED: true,

    /** Enable access to the remote query library */
    REMOTE_LIBRARY_ENABLED: true,

    /** Default number of rows to return */
    ROWS_RETURNED_DEFAULT: 100,

    /** File Cabinet folder ID for local query library (null = disabled) */
    QUERY_FOLDER_ID: null,

    /** Enable NetSuite Workbooks integration */
    WORKBOOKS_ENABLED: false,

    /** Maximum query history entries to store */
    MAX_HISTORY_ENTRIES: 50,

    /** Slow query threshold in milliseconds - shows optimization banner when exceeded */
    SLOW_QUERY_THRESHOLD_MS: 3000,

    /** Remote library base URL */
    REMOTE_LIBRARY_URL: 'https://suiteql.s3.us-east-1.amazonaws.com/queries/',

    /**
     * Allow users to ask AI about query results.
     *
     * IMPORTANT: Enable this option only after careful consideration of the following risks:
     * - Query results containing sensitive or confidential business data will be sent to
     *   external AI services (Anthropic or OpenAI) for processing.
     * - Data transmitted may include customer information, financial figures, employee
     *   details, or other proprietary information depending on the queries executed.
     * - While these AI providers have data handling policies, transmitted data leaves
     *   your organization's direct control.
     * - Consider your organization's data governance policies and any regulatory
     *   requirements (GDPR, HIPAA, SOC2, etc.) before enabling this feature.
     *
     * Default: false (disabled)
     */
    AI_RESULTS_CHAT_ENABLED: false
});

// =============================================================================
// SECTION 2: NETSUITE MODULE DEFINITION
// =============================================================================

/** @type {Object} NetSuite module references */
let modules = {};

define([
    'N/file',
    'N/https',
    'N/log',
    'N/query',
    'N/record',
    'N/render',
    'N/runtime',
    'N/ui/serverWidget',
    'N/url',
    'oauth',
    'secret'
], (file, https, log, query, record, render, runtime, serverWidget, url, oauth, secret) => {

    // Store module references
    modules = { file, https, log, query, record, render, runtime, serverWidget, url, oauth, secret };

    const remoteAccounts = (() => {
        try {
            const param = modules.runtime.getCurrentScript().getParameter({
                name: 'custscript_il_suiteql_accounts'
            });
            return param ? JSON.parse(param) : [];
        } catch (e) {
            modules.log.error({ title: 'Remote Accounts JSON Error', details: e });
            return [];
        }
    })();


    return {
        /**
         * Main entry point for the Suitelet.
         * @param {Object} context - The request/response context
         */
        onRequest: (context) => {
            const scriptUrl = modules.url.resolveScript({
                scriptId: modules.runtime.getCurrentScript().id,
                deploymentId: modules.runtime.getCurrentScript().deploymentId,
                returnExternalURL: false
            });

            const scriptParam = modules.runtime.getCurrentScript().getParameter({
                name: 'custscript_il_suiteql_accounts'
            });

            let remoteAccounts = [];

            try {
                remoteAccounts = scriptParam ? JSON.parse(scriptParam) : [];
            } catch (e) {
                modules.log.error({ title: 'Invalid JSON in custscript_il_suiteql_accounts', details: e });
                remoteAccounts = [];
            }

            // Extract current account ID
            const currentAccountId = modules.runtime.accountId?.toLowerCase();

            remoteAccounts = remoteAccounts.filter(acc => {
                const accountId = (acc.account || '').toLowerCase();

                modules.log.debug('account', {
                    account: accountId,
                    currentAccountId: currentAccountId
                });

                return accountId !== currentAccountId;
            });

            if (context.request.method === 'POST') {
                handlePostRequest(context, scriptUrl);
            } else {
                handleGetRequest(context, scriptUrl, remoteAccounts, currentAccountId);
            }
        }
    };
});

// =============================================================================
// SECTION 3: REQUEST HANDLERS
// =============================================================================

/**
 * Handles GET requests - renders the main UI or specific views.
 * @param {Object} context - The request/response context
 * @param {string} scriptUrl - The script URL for AJAX calls
 * @param {Array<Object>} remoteAccounts
 *        List of configured remote NetSuite accounts parsed from the
 *        `custscript_il_suiteql_accounts` script parameter.
 *        Each entry contains metadata such as description, account ID,
 *        and execution URL, and is injected into the client at page load.
 *
 * @param {string} currentAccountId
 *        Account ID of the current NetSuite environment (e.g. sandbox or
 *        production). Used by the client to resolve and label local query
 *        execution context.
 */
function handleGetRequest(context, scriptUrl, remoteAccounts, currentAccountId) {
    const params = context.request.parameters;

    if (params.function === 'tablesReference') {
        renderTablesReference(context, scriptUrl);
        return;
    }

    if (params.function === 'documentGenerate') {
        generateDocument(context);
        return;
    }

    // Render main application
    const form = modules.serverWidget.createForm({
        title: 'SuiteQL Query Tool',
        hideNavBar: false
    });

    const htmlField = form.addField({
        id: 'custpage_field_html',
        type: modules.serverWidget.FieldType.INLINEHTML,
        label: 'HTML'
    });

    htmlField.defaultValue = generateMainHtml(scriptUrl, remoteAccounts, currentAccountId);
    context.response.writePage(form);
}

/**
 * Handles POST requests - API endpoints for AJAX calls.
 * @param {Object} context - The request/response context
 * @param {string} scriptUrl - The script URL
 */
function handlePostRequest(context, scriptUrl) {
    const requestPayload = JSON.parse(context.request.body);
    context.response.setHeader('Content-Type', 'application/json');

    const handlers = {
        'queryExecute': () => executeQuery(context, requestPayload),
        'documentSubmit': () => submitDocument(context, requestPayload),
        'sqlFileExists': () => checkSqlFileExists(context, requestPayload),
        'sqlFileLoad': () => loadSqlFile(context, requestPayload),
        'sqlFileSave': () => saveSqlFile(context, requestPayload),
        'localLibraryFilesGet': () => getLocalLibraryFiles(context),
        'workbookLoad': () => loadWorkbook(context, requestPayload),
        'workbooksGet': () => getWorkbooks(context),
        'aiGenerateQuery': () => generateAIQuery(context, requestPayload)
    };

    const handler = handlers[requestPayload.function];

    if (handler) {
        handler();
    } else {
        modules.log.error({
            title: 'Unknown Function',
            details: requestPayload.function
        });
        context.response.write(JSON.stringify({ error: 'Unknown function' }));
    }
}

// =============================================================================
// SECTION 4: QUERY EXECUTION
// =============================================================================

/**
 * Executes a SuiteQL query and returns results.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload containing query details
 */
/*
function executeQuery(context, payload) {
    let responsePayload;

    try {
        const beginTime = Date.now();
        let records = [];
        let sqlToExecute = payload.query + '\n';

        log.debug('payload', payload);
        log.debug('sqlToExecute', sqlToExecute);

        // Process virtual views if enabled
        if (payload.viewsEnabled && CONFIG.QUERY_FOLDER_ID) {
            sqlToExecute = processVirtualViews(sqlToExecute);
        }

        if (payload.paginationEnabled) {
            records = executePaginatedQuery(sqlToExecute, payload.rowBegin, payload.rowEnd);
        } else {
            records = modules.query.runSuiteQL({
                query: sqlToExecute,
                params: []
            }).asMappedResults();
        }

        const elapsedTime = Date.now() - beginTime;

        responsePayload = {
            records,
            elapsedTime,
            rowCount: records.length
        };

        // Get total count if requested
        if (payload.returnTotals && records.length > 0) {
            const countSql = `SELECT COUNT(*) AS TotalRecordCount FROM (${sqlToExecute})`;
            const countResult = modules.query.runSuiteQL({
                query: countSql,
                params: []
            }).asMappedResults();
            responsePayload.totalRecordCount = countResult[0]?.totalrecordcount || 0;
        }

    } catch (e) {
        modules.log.error({ title: 'Query Execution Error', details: e });
        responsePayload = { error: { message: e.message, name: e.name } };
    }

    context.response.write(JSON.stringify(responsePayload, null, 2));
}
*/

function executeQuery(context, payload) {
    let responsePayload;

    try {
        if (payload.remoteUrl) {
            const match = payload.remoteUrl.match(/^https:\/\/(.*?)\./);
            const subdomain = match ? match[1] : null;
            if (!subdomain) {
                throw new Error('Invalid remoteUrl format: unable to extract subdomain');
            }

            const realmKey = subdomain.replace('-', '_').toUpperCase();

            // Match against realm in secret config
            const config = modules.secret.find((entry) => entry.realm === realmKey);
            if (!config) {
                throw new Error('No credentials found for remote account with realm: ' + realmKey);
            }

            const auth = modules.oauth.OAuth({
                realm: config.realm,
                consumer: {
                    key: config.consumer.key,
                    secret: config.consumer.secret
                },
                signature_method: 'HMAC-SHA256',
                hash_function: modules.oauth.sha256
            });

            const headers = modules.oauth.getHeaders({
                url: payload.remoteUrl,
                method: 'POST',
                tokenKey: config.token.id,
                tokenSecret: config.token.secret
            }, auth);

            headers['Content-Type'] = 'application/json';

            const response = modules.https.request({
                method: 'POST',
                url: payload.remoteUrl,
                headers: headers,
                body: JSON.stringify(payload)
            });

            responsePayload = JSON.parse(response.body);

        } else {
            const beginTime = Date.now();
            let records = [];
            let sqlToExecute = payload.query + '\n';

            modules.log.debug('payload', payload);
            modules.log.debug('sqlToExecute', sqlToExecute);

            if (payload.viewsEnabled && CONFIG.QUERY_FOLDER_ID) {
                sqlToExecute = processVirtualViews(sqlToExecute);
            }

            if (payload.paginationEnabled) {
                records = executePaginatedQuery(sqlToExecute, payload.rowBegin, payload.rowEnd);
            } else {
                records = modules.query.runSuiteQL({
                    query: sqlToExecute,
                    params: []
                }).asMappedResults();
            }

            const elapsedTime = Date.now() - beginTime;

            responsePayload = {
                records,
                elapsedTime,
                rowCount: records.length
            };

            if (payload.returnTotals && records.length > 0) {
                const countSql = `SELECT COUNT(*) AS TotalRecordCount FROM (${sqlToExecute})`;
                const countResult = modules.query.runSuiteQL({
                    query: countSql,
                    params: []
                }).asMappedResults();
                responsePayload.totalRecordCount = countResult[0]?.totalrecordcount || 0;
            }
        }

    } catch (e) {
        modules.log.error({ title: 'Query Execution Error', details: e });
        responsePayload = { error: { message: e.message, name: e.name } };
    }

    context.response.write(JSON.stringify(responsePayload, null, 2));
}



/**
 * Executes a paginated query with ROWNUM support.
 * @param {string} sql - The SQL query
 * @param {number} rowBegin - Starting row number
 * @param {number} rowEnd - Ending row number
 * @returns {Array} Query results
 */
function executePaginatedQuery(sql, rowBegin, rowEnd) {
    let records = [];
    let moreRecords = true;
    let currentBegin = rowBegin;

    while (moreRecords) {
        const paginatedSql = `
            SELECT * FROM (
                SELECT ROWNUM AS ROWNUMBER, * FROM (${sql})
            ) WHERE ROWNUMBER BETWEEN ${currentBegin} AND ${rowEnd}
        `;

        const results = modules.query.runSuiteQL({
            query: paginatedSql,
            params: []
        }).asMappedResults();

        records = records.concat(results);

        if (results.length < 5000) {
            moreRecords = false;
        }

        currentBegin += 5000;
    }

    return records;
}

/**
 * Processes virtual view references in SQL.
 * @param {string} sql - The SQL with potential view references
 * @returns {string} Processed SQL with views expanded
 */
function processVirtualViews(sql) {
    const viewPattern = /(?:^|\s)#(\w+)\b/gi;
    const views = sql.match(viewPattern);

    if (!views || views.length === 0) {
        return sql;
    }

    let processedSql = sql;

    for (const view of views) {
        const cleanView = view.replace(/\s+/g, '');
        const viewFileName = cleanView.substring(1) + '.sql';

        const fileSql = 'SELECT ID FROM File WHERE Folder = ? AND Name = ?';
        const files = modules.query.runSuiteQL({
            query: fileSql,
            params: [CONFIG.QUERY_FOLDER_ID, viewFileName]
        }).asMappedResults();

        if (files.length === 1) {
            const fileObj = modules.file.load({ id: files[0].id });
            const viewSql = fileObj.getContents();
            processedSql = processedSql.replace(
                cleanView,
                `(${viewSql}) AS ${cleanView.substring(1)}`
            );
        } else {
            throw new Error(`Unresolved view: ${viewFileName}`);
        }
    }

    return processedSql;
}

// =============================================================================
// SECTION 5: FILE OPERATIONS
// =============================================================================

/**
 * Gets list of SQL files from local library.
 * @param {Object} context - The request/response context
 */
function getLocalLibraryFiles(context) {
    try {
        if (!CONFIG.QUERY_FOLDER_ID) {
            context.response.write(JSON.stringify({
                error: 'Local library not configured (QUERY_FOLDER_ID is not set)'
            }));
            return;
        }

        const sql = `
            SELECT ID, Name, Description
            FROM File
            WHERE Folder = ?
            ORDER BY Name
        `;

        const records = modules.query.runSuiteQL({
            query: sql,
            params: [CONFIG.QUERY_FOLDER_ID]
        }).asMappedResults();

        const response = records.length > 0
            ? { records }
            : { error: 'No SQL Files' };

        context.response.write(JSON.stringify(response, null, 2));
    } catch (e) {
        modules.log.error({ title: 'Get Local Library Files Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

/**
 * Checks if a SQL file exists in the local library.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload
 */
function checkSqlFileExists(context, payload) {
    try {
        if (!CONFIG.QUERY_FOLDER_ID) {
            context.response.write(JSON.stringify({
                error: 'Local library not configured (QUERY_FOLDER_ID is not set)'
            }));
            return;
        }

        const sql = `
            SELECT ID FROM File
            WHERE Folder = ? AND Name = ?
        `;

        const records = modules.query.runSuiteQL({
            query: sql,
            params: [CONFIG.QUERY_FOLDER_ID, payload.filename]
        }).asMappedResults();

        context.response.write(JSON.stringify({
            exists: records.length > 0
        }));
    } catch (e) {
        modules.log.error({ title: 'Check SQL File Exists Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

/**
 * Loads a SQL file from the file cabinet.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload
 */
function loadSqlFile(context, payload) {
    try {
        const fileObj = modules.file.load({ id: payload.fileID });

        context.response.write(JSON.stringify({
            file: {
                id: fileObj.id,
                name: fileObj.name,
                description: fileObj.description
            },
            sql: fileObj.getContents()
        }));
    } catch (e) {
        modules.log.error({ title: 'Load SQL File Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

/**
 * Saves a SQL file to the file cabinet.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload
 */
function saveSqlFile(context, payload) {
    try {
        if (!CONFIG.QUERY_FOLDER_ID) {
            context.response.write(JSON.stringify({
                error: 'Local library not configured (QUERY_FOLDER_ID is not set)'
            }));
            return;
        }

        const fileObj = modules.file.create({
            name: payload.filename,
            contents: payload.contents,
            description: payload.description,
            fileType: modules.file.Type.PLAINTEXT,
            folder: CONFIG.QUERY_FOLDER_ID,
            isOnline: false
        });

        const fileId = fileObj.save();

        context.response.write(JSON.stringify({ fileID: fileId }));
    } catch (e) {
        modules.log.error({ title: 'Save SQL File Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

// =============================================================================
// SECTION 6: WORKBOOKS
// =============================================================================

/**
 * Gets list of available workbooks.
 * @param {Object} context - The request/response context
 */
function getWorkbooks(context) {
    const sql = `
        SELECT ScriptID, Name, Description, BUILTIN.DF(Owner) AS Owner
        FROM UsrSavedSearch
        ORDER BY Name
    `;

    const records = modules.query.runSuiteQL({
        query: sql,
        params: []
    }).asMappedResults();

    const response = records.length > 0
        ? { records }
        : { error: 'No Workbooks' };

    context.response.write(JSON.stringify(response, null, 2));
}

/**
 * Loads a workbook and converts to SuiteQL.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload
 */
function loadWorkbook(context, payload) {
    try {
        const loadedQuery = modules.query.load({ id: payload.scriptID });

        context.response.write(JSON.stringify({
            sql: loadedQuery.toSuiteQL().query
        }));
    } catch (e) {
        modules.log.error({ title: 'Load Workbook Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

// =============================================================================
// SECTION 6.5: AI QUERY GENERATION
// =============================================================================

/**
 * System prompt optimized for SuiteQL generation.
 * This is hardcoded and not user-customizable.
 */
const AI_SYSTEM_PROMPT = `You are a SuiteQL expert assistant for NetSuite. Your role is to help users write SuiteQL queries.

SuiteQL Key Points:
- SuiteQL is NetSuite's SQL-like query language based on Oracle SQL syntax
- Tables use internal IDs (e.g., "Transaction", "Customer", "Employee", "Item")
- Use BUILTIN.DF() function to get display values for reference fields: BUILTIN.DF(fieldname)
- Common joins: Transaction to TransactionLine, Customer to Transaction, Employee to Department
- Date functions: TO_DATE(), TO_CHAR(), ADD_MONTHS(), TRUNC()
- String functions: UPPER(), LOWER(), SUBSTR(), INSTR(), NVL()
- Use NVL(field, default) for null handling
- ROWNUM for limiting results (no LIMIT keyword)
- Use single quotes for string literals
- Boolean fields use 'T' and 'F' values

Common Table Names:
- Transaction (sales orders, invoices, etc.) with type field for filtering
- TransactionLine for line items
- Customer, Vendor, Employee, Partner
- Item, InventoryItem, ServiceItem, NonInventoryItem
- Account, Department, Location, Subsidiary, Classification
- EntityAddress for addresses
- File for file cabinet files

When generating queries:
1. Always include relevant fields the user would need
2. Use meaningful aliases for complex expressions
3. Add ORDER BY when it makes sense
4. Include comments explaining complex logic
5. Format queries for readability

If the user's request is unclear, ask clarifying questions.
If you generate a query, wrap it in a SQL code block using triple backticks with 'sql' language identifier.

Example response format:
\`\`\`sql
SELECT
    Customer.entityid AS customer_id,
    Customer.companyname,
    BUILTIN.DF(Customer.salesrep) AS sales_rep
FROM Customer
WHERE Customer.isinactive = 'F'
ORDER BY Customer.companyname
\`\`\``;

/**
 * System prompt for table-related AI queries in the Tables Reference.
 * Optimized for helping users understand NetSuite tables and find the right tables.
 */
const AI_TABLE_SYSTEM_PROMPT = `You are a NetSuite SuiteQL tables expert. Your role is to help users understand NetSuite database tables and find the right tables for their needs.

NetSuite Database Knowledge:
- NetSuite has hundreds of tables accessible via SuiteQL
- Tables use internal IDs (e.g., "Transaction", "Customer", "Employee")
- BUILTIN.DF() returns display values for foreign key fields
- Common transaction types are filtered via the "type" field in the Transaction table
- Many tables support joins through foreign key relationships

Common Table Categories:
1. **Core Entities**: Customer, Vendor, Employee, Partner, Contact, Lead, Prospect
2. **Transactions**: Transaction (header), TransactionLine (lines), TransactionAccountingLine
3. **Items**: Item, InventoryItem, ServiceItem, NonInventoryItem, AssemblyItem, KitItem
4. **Accounting**: Account, AccountingPeriod, Currency, ExchangeRate
5. **Organization**: Subsidiary, Department, Location, Classification
6. **CRM**: Opportunity, Case (supportcase), Campaign, PhoneCall, Task, Event
7. **Addresses**: EntityAddress, TransactionAddress
8. **Files**: File, Folder
9. **Users/Roles**: Employee, Role, SystemNote
10. **Custom**: Custom records use format customrecord_*

Transaction Type Values (for Transaction.type):
- SalesOrd (Sales Order), Invoice (Invoice), CustInvc (Customer Invoice)
- PurchOrd (Purchase Order), VendBill (Vendor Bill)
- CashSale, CustPymt (Customer Payment), VendPymt (Vendor Payment)
- Journal, Check, Deposit, Transfer
- ItemRcpt (Item Receipt), ItemShip (Item Fulfillment)
- RtnAuth (Return Authorization), CustCred (Credit Memo)

Key Relationships:
- Transaction → TransactionLine: Transaction.id = TransactionLine.transaction
- Transaction → Customer: Transaction.entity = Customer.id
- TransactionLine → Item: TransactionLine.item = Item.id
- Customer → EntityAddress: Through Customer.defaultbillingaddress/defaultshippingaddress
- Employee → Department: Employee.department = Department.id

Important Columns by Table:
- **Customer**: id, entityid, companyname, email, phone, salesrep, terms, creditlimit, isinactive
- **Transaction**: id, tranid, type, entity, trandate, status, total, subsidiary, postingperiod
- **TransactionLine**: id, transaction, linesequencenumber, item, quantity, amount, rate
- **Item**: id, itemid, displayname, baseprice, itemtype, isinactive
- **Employee**: id, entityid, firstname, lastname, email, department, location, supervisor

When helping users:
1. If asked about a specific table, explain its purpose and common use cases
2. If asked to find tables, suggest multiple relevant options with explanations
3. If generating queries, use proper joins and include helpful comments
4. Format SQL in code blocks with the 'sql' language identifier
5. Explain why certain columns or joins are important
6. Mention BUILTIN.DF() when reference fields would benefit from display values

When suggesting tables for a user's needs:
- Consider what data they're trying to access
- Suggest primary tables AND related tables they might need
- Explain how tables connect via joins`;

/**
 * Generates a query using AI API (Anthropic or OpenAI).
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload containing:
 *   - provider: 'anthropic' or 'openai'
 *   - apiKey: The API key
 *   - model: The model to use
 *   - messages: Array of conversation messages
 *   - mode: 'query' (default) or 'tables' for table reference assistance
 */
function generateAIQuery(context, payload) {
    let responsePayload;

    try {
        const { provider, apiKey, model, messages, mode } = payload;

        if (!provider || !apiKey || !model || !messages) {
            throw new Error('Missing required parameters: provider, apiKey, model, or messages');
        }

        // Select system prompt based on mode
        const systemPrompt = mode === 'tables' ? AI_TABLE_SYSTEM_PROMPT : AI_SYSTEM_PROMPT;

        let aiResponse;

        if (provider === 'anthropic') {
            aiResponse = callAnthropicAPI(apiKey, model, messages, systemPrompt);
        } else if (provider === 'openai') {
            aiResponse = callOpenAIAPI(apiKey, model, messages, systemPrompt);
        } else {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        responsePayload = {
            success: true,
            response: aiResponse.content,
            usage: aiResponse.usage
        };

    } catch (e) {
        modules.log.error({ title: 'AI Query Generation Error', details: e });

        // Parse specific error types for better user feedback
        let errorMessage = e.message;
        let errorType = 'error';

        if (e.message.includes('401') || e.message.includes('invalid_api_key') || e.message.includes('Unauthorized')) {
            errorMessage = 'Invalid API key. Please check your API key in settings.';
            errorType = 'auth_error';
        } else if (e.message.includes('429') || e.message.includes('rate_limit')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
            errorType = 'rate_limit';
        } else if (e.message.includes('500') || e.message.includes('502') || e.message.includes('503')) {
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
            errorType = 'service_error';
        }

        responsePayload = {
            error: {
                message: errorMessage,
                type: errorType,
                details: e.message
            }
        };
    }

    context.response.write(JSON.stringify(responsePayload, null, 2));
}

/**
 * Calls the Anthropic Claude API.
 * @param {string} apiKey - The Anthropic API key
 * @param {string} model - The model ID
 * @param {Array} messages - Array of conversation messages
 * @param {string} systemPrompt - The system prompt to use
 * @returns {Object} Response with content and usage
 */
function callAnthropicAPI(apiKey, model, messages, systemPrompt) {
    const requestBody = {
        model: model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content
        }))
    };

    const response = modules.https.post({
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
    });

    const responseBody = JSON.parse(response.body);

    if (response.code !== 200) {
        throw new Error(responseBody.error?.message || `Anthropic API error: ${response.code}`);
    }

    return {
        content: responseBody.content[0].text,
        usage: responseBody.usage
    };
}

/**
 * Calls the OpenAI API.
 * @param {string} apiKey - The OpenAI API key
 * @param {string} model - The model ID
 * @param {Array} messages - Array of conversation messages
 * @param {string} systemPrompt - The system prompt to use
 * @returns {Object} Response with content and usage
 */
function callOpenAIAPI(apiKey, model, messages, systemPrompt) {
    // Prepend system message for OpenAI
    const openAIMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role,
            content: m.content
        }))
    ];

    const requestBody = {
        model: model,
        max_tokens: 4096,
        messages: openAIMessages
    };

    const response = modules.https.post({
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    const responseBody = JSON.parse(response.body);

    if (response.code !== 200) {
        throw new Error(responseBody.error?.message || `OpenAI API error: ${response.code}`);
    }

    return {
        content: responseBody.choices[0].message.content,
        usage: responseBody.usage
    };
}

// =============================================================================
// SECTION 7: DOCUMENT GENERATION
// =============================================================================

/**
 * Submits document info to session for generation.
 * @param {Object} context - The request/response context
 * @param {Object} payload - The request payload
 */
function submitDocument(context, payload) {
    try {
        const session = modules.runtime.getCurrentSession();
        session.set({
            name: 'suiteQLDocumentInfo',
            value: JSON.stringify(payload)
        });

        context.response.write(JSON.stringify({ submitted: true }));
    } catch (e) {
        modules.log.error({ title: 'Document Submit Error', details: e });
        context.response.write(JSON.stringify({ error: e.message }));
    }
}

/**
 * Generates a PDF or HTML document from query results.
 * @param {Object} context - The request/response context
 */
function generateDocument(context) {
    try {
        const session = modules.runtime.getCurrentSession();
        const docInfo = JSON.parse(session.get({ name: 'suiteQLDocumentInfo' }));

        // Execute query with pagination
        const records = executePaginatedQuery(
            docInfo.query,
            docInfo.rowBegin,
            docInfo.rowEnd
        );

        // Render document
        const renderer = modules.render.create();
        renderer.addCustomDataSource({
            alias: 'results',
            format: modules.render.DataSource.OBJECT,
            data: { records }
        });
        renderer.templateContent = docInfo.template;

        if (docInfo.docType === 'pdf') {
            const pdfObj = renderer.renderAsPdf();
            context.response.setHeader('Content-Type', 'application/pdf');
            context.response.write(pdfObj.getContents());
        } else {
            const htmlString = renderer.renderAsString();
            context.response.setHeader('Content-Type', 'text/html');
            context.response.write(htmlString);
        }

    } catch (e) {
        modules.log.error({ title: 'Document Generation Error', details: e });
        context.response.write(`Error: ${e.message}`);
    }
}

// =============================================================================
// SECTION 8: TABLES REFERENCE
// =============================================================================

/**
 * Renders the Tables Reference page.
 * @param {Object} context - The request/response context
 * @param {string} scriptUrl - The script URL
 */
function renderTablesReference(context, scriptUrl) {
    const form = modules.serverWidget.createForm({
        title: 'SuiteQL Tables Reference',
        hideNavBar: false
    });

    const htmlField = form.addField({
        id: 'custpage_field_html',
        type: modules.serverWidget.FieldType.INLINEHTML,
        label: 'HTML'
    });

    htmlField.defaultValue = generateTablesReferenceHtml(scriptUrl);
    context.response.writePage(form);
}

// =============================================================================
// SECTION 9: HTML GENERATION - MAIN APPLICATION
// =============================================================================

/**
 * Generates the main application HTML.
 *
 * @param {string} scriptUrl - The script URL for AJAX calls
 * @param {Array<Object>} remoteAccounts
 *        List of configured remote NetSuite accounts parsed from the
 *        `custscript_il_suiteql_accounts` script parameter.
 * @param {string} currentAccountId
 *        Account ID of the current NetSuite environment (sandbox or
 *        production), used to resolve local execution context.
 * @returns {string} Complete HTML for the application
 *
 */
function generateMainHtml(scriptUrl, remoteAccounts, currentAccountId) {
    return `
        <!DOCTYPE html>
        <html lang="en" data-bs-theme="light">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${generateExternalResources()}
            ${generateStyles()}
        </head>
        <body>
            ${generateToastContainer()}
            ${generateMainLayout(scriptUrl, remoteAccounts)}
            ${generateModals()}
            ${generateClientScript(scriptUrl, remoteAccounts, currentAccountId)}
        </body>
        </html>
    `;
}

/**
 * Generates external resource links (CSS/JS libraries).
 * @returns {string} HTML for external resources
 */
function generateExternalResources() {
    return `
        <!-- Bootstrap 5.3 -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

        <!-- CodeMirror -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/eclipse.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.css" rel="stylesheet">

        <!-- DataTables -->
        <link href="https://cdn.datatables.net/2.0.0/css/dataTables.dataTables.min.css" rel="stylesheet">

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>

        <!-- Safari/WebKit fix for MouseEvent.buttons - must load before CodeMirror -->
        <script>
        (function() {
            var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (!isSafari) return;

            // Map to track original listeners to their wrapped versions
            var listenerMap = new WeakMap();

            // Patch addEventListener to fix buttons property on mouse events
            var originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'mousemove' || type === 'mouseup' || type === 'mousedown') {
                    var wrappedListener = function(e) {
                        if (e.buttons === 0 && e.which > 0 && e.type !== 'mouseup') {
                            Object.defineProperty(e, 'buttons', {
                                get: function() {
                                    if (e.which === 1) return 1;
                                    if (e.which === 2) return 4;
                                    if (e.which === 3) return 2;
                                    return 0;
                                }
                            });
                        }
                        return listener.call(this, e);
                    };
                    // Store mapping from original to wrapped listener (per element and type)
                    if (!listenerMap.has(this)) {
                        listenerMap.set(this, {});
                    }
                    var elementMap = listenerMap.get(this);
                    if (!elementMap[type]) {
                        elementMap[type] = new Map();
                    }
                    elementMap[type].set(listener, wrappedListener);
                    return originalAddEventListener.call(this, type, wrappedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };

            // Patch removeEventListener to use the wrapped listener
            var originalRemoveEventListener = EventTarget.prototype.removeEventListener;
            EventTarget.prototype.removeEventListener = function(type, listener, options) {
                if (type === 'mousemove' || type === 'mouseup' || type === 'mousedown') {
                    var elementMap = listenerMap.get(this);
                    if (elementMap && elementMap[type] && elementMap[type].has(listener)) {
                        var wrappedListener = elementMap[type].get(listener);
                        elementMap[type].delete(listener);
                        return originalRemoveEventListener.call(this, type, wrappedListener, options);
                    }
                }
                return originalRemoveEventListener.call(this, type, listener, options);
            };

        })();
        <\/script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/sql/sql.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/sql-hint.min.js"><\/script>
        <script src="https://cdn.datatables.net/2.0.0/js/dataTables.min.js"><\/script>
        <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"><\/script>
    `;
}

/**
 * Generates CSS styles for the application.
 * @returns {string} CSS styles in a style tag
 */
function generateStyles() {
    return `
        <style>
            /* ============================================
               CSS VARIABLES & THEMING
               ============================================ */
            :root {
                --sqt-primary: #2563eb;
                --sqt-primary-hover: #1d4ed8;
                --sqt-success: #10b981;
                --sqt-warning: #f59e0b;
                --sqt-danger: #ef4444;
                --sqt-bg-primary: #ffffff;
                --sqt-bg-secondary: #f8fafc;
                --sqt-bg-tertiary: #f1f5f9;
                --sqt-border: #e2e8f0;
                --sqt-text-primary: #1e293b;
                --sqt-text-secondary: #64748b;
                --sqt-text-muted: #94a3b8;
                --sqt-sidebar-width: 280px;
                --sqt-header-height: 56px;
                --sqt-editor-font: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
            }

            [data-bs-theme="dark"] {
                --sqt-primary: #3b82f6;
                --sqt-primary-hover: #60a5fa;
                --sqt-bg-primary: #0f172a;
                --sqt-bg-secondary: #1e293b;
                --sqt-bg-tertiary: #334155;
                --sqt-border: #334155;
                --sqt-text-primary: #f1f5f9;
                --sqt-text-secondary: #94a3b8;
                --sqt-text-muted: #64748b;
            }

            /* ============================================
               BASE STYLES
               ============================================ */
            * {
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 14px;
                background-color: var(--sqt-bg-secondary);
                color: var(--sqt-text-primary);
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            /* ============================================
               LAYOUT
               ============================================ */
            .sqt-app {
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
                max-width: 100vw;
            }

            .sqt-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: var(--sqt-header-height);
                padding: 0 24px;
                background: var(--sqt-bg-primary);
                border-bottom: 1px solid var(--sqt-border);
                flex-shrink: 0;
                position: relative;
                z-index: 100;
                min-width: 0;
            }

            .sqt-header-title {
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
                font-size: 16px;
                color: var(--sqt-text-primary);
            }

            .sqt-header-title i {
                color: var(--sqt-primary);
                font-size: 20px;
            }

            .sqt-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                padding-right: 8px;
                flex-shrink: 0;
            }

            .sqt-main {
                display: flex;
                flex: 1;
                overflow: hidden;
                min-width: 0;
                max-width: 100%;
            }

            /* ============================================
               SIDEBAR
               ============================================ */
            .sqt-sidebar {
                width: var(--sqt-sidebar-width);
                background: var(--sqt-bg-primary);
                border-right: 1px solid var(--sqt-border);
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                transition: width 0.2s ease;
            }

            .sqt-sidebar.collapsed {
                width: 0;
                border-right: none;
                overflow: hidden;
            }

            .sqt-sidebar-header {
                padding: 12px 16px;
                border-bottom: 1px solid var(--sqt-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: var(--sqt-sidebar-width);
            }

            .sqt-sidebar-title {
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--sqt-text-secondary);
            }

            .sqt-history-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                min-width: var(--sqt-sidebar-width);
            }

            .sqt-history-item {
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                margin-bottom: 4px;
                transition: background-color 0.15s ease;
            }

            .sqt-history-item:hover {
                background: var(--sqt-bg-tertiary);
            }

            .sqt-history-item-query {
                font-family: var(--sqt-editor-font);
                font-size: 11px;
                color: var(--sqt-text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 4px;
            }

            .sqt-history-item-meta {
                font-size: 10px;
                color: var(--sqt-text-muted);
                display: flex;
                gap: 8px;
            }

            /* ============================================
               FLOATING HISTORY BUTTON
               ============================================ */
            .sqt-history-float-btn {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 24px;
                height: 64px;
                background: var(--sqt-bg-secondary);
                border: 1px solid var(--sqt-border);
                border-left: none;
                border-radius: 0 6px 6px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 100;
                transition: all 0.2s ease;
                color: var(--sqt-text-secondary);
            }

            .sqt-history-float-btn:hover {
                background: var(--sqt-bg-tertiary);
                color: var(--sqt-text-primary);
                width: 28px;
            }

            .sqt-history-float-btn i {
                font-size: 14px;
            }

            /* Hide floating button when sidebar is open */
            .sqt-sidebar:not(.collapsed) ~ .sqt-content .sqt-history-float-btn {
                opacity: 0;
                pointer-events: none;
            }

            /* ============================================
               CONTENT AREA
               ============================================ */
            .sqt-content {
                position: relative;
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                min-width: 0;
                max-width: 100%;
            }

            /* ============================================
               TOOLBAR
               ============================================ */
            .sqt-toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: var(--sqt-bg-primary);
                border-bottom: 1px solid var(--sqt-border);
                flex-wrap: wrap;
                flex-shrink: 0;
                min-width: 0;
            }

            .sqt-toolbar-group {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .sqt-toolbar-divider {
                width: 1px;
                height: 24px;
                background: var(--sqt-border);
                margin: 0 8px;
            }

            /* Compact toolbar mode - hide button labels */
            .sqt-toolbar-compact .sqt-btn:not(.sqt-btn-icon) > span:not(.bi) {
                display: none;
            }

            .sqt-toolbar-compact .sqt-btn-dropdown > span:not(.bi):not(.bi-chevron-down) {
                display: none;
            }

            .sqt-toolbar-compact .sqt-btn-dropdown {
                gap: 2px;
            }

            /* ============================================
               BUTTONS
               ============================================ */
            .sqt-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                font-size: 13px;
                font-weight: 500;
                border-radius: 6px;
                border: 1px solid transparent;
                cursor: pointer;
                transition: all 0.15s ease;
                white-space: nowrap;
            }

            .sqt-btn i {
                font-size: 14px;
            }

            .sqt-btn-primary {
                background: var(--sqt-primary);
                color: white;
            }

            .sqt-btn-primary:hover {
                background: var(--sqt-primary-hover);
            }

            .sqt-btn-secondary {
                background: var(--sqt-bg-tertiary);
                color: var(--sqt-text-primary);
                border-color: var(--sqt-border);
            }

            .sqt-btn-secondary:hover {
                background: var(--sqt-border);
            }

            .sqt-btn-secondary.active {
                background: var(--sqt-primary);
                color: white;
                border-color: var(--sqt-primary);
            }

            .sqt-btn-icon {
                padding: 6px 8px;
            }

            .sqt-btn-sm {
                padding: 4px 8px;
                font-size: 12px;
            }

            /* ============================================
               DATATABLES OVERRIDES
               ============================================ */
            .dt-length,
            .dt-length select,
            .dt-length label,
            .dt-search,
            .dt-search input,
            .dt-search label,
            .dt-info,
            .dt-paging {
                font-size: 12px !important;
            }

            .dt-length select {
                padding: 4px 28px 4px 8px;
                min-width: 70px;
            }

            .dt-search input {
                padding: 4px 8px;
            }

            /* DataTables pagination styling */
            .dt-paging {
                padding-top: 10px;
            }

            .dt-paging button {
                padding: 4px 10px !important;
                margin: 0 2px !important;
                border: 1px solid var(--sqt-border) !important;
                border-radius: 4px !important;
                background: var(--sqt-bg-primary) !important;
                color: var(--sqt-text-primary) !important;
                cursor: pointer;
                font-size: 12px !important;
            }

            .dt-paging button:hover:not(.disabled) {
                background: var(--sqt-bg-secondary) !important;
            }

            .dt-paging button.current {
                background: var(--sqt-primary) !important;
                border-color: var(--sqt-primary) !important;
                color: white !important;
            }

            .dt-paging button.disabled {
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }

            /* ============================================
               EDITOR PANEL
               ============================================ */
            .sqt-editor-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 200px;
                overflow: hidden;
            }

            .sqt-editor-container {
                flex: 1;
                overflow: hidden;
                border-bottom: 1px solid var(--sqt-border);
            }

            .CodeMirror {
                height: 100%;
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                line-height: 1.6;
            }

            .CodeMirror-gutters {
                background: var(--sqt-bg-secondary);
                border-right: 1px solid var(--sqt-border);
            }

            [data-bs-theme="light"] .CodeMirror {
                background: var(--sqt-bg-primary);
            }

            /* ============================================
               RESULTS PANEL
               ============================================ */
            .sqt-results-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 200px;
                background: var(--sqt-bg-primary);
                overflow: hidden;
                min-width: 0;
                max-width: 100%;
            }

            .sqt-results-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 16px;
                background: var(--sqt-bg-secondary);
                border-bottom: 1px solid var(--sqt-border);
                flex-shrink: 0;
                min-width: 0;
                gap: 16px;
            }

            .sqt-results-info {
                font-size: 12px;
                color: var(--sqt-text-secondary);
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .sqt-results-info-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .sqt-results-info-item i {
                color: var(--sqt-text-muted);
            }

            .sqt-cache-miss-badge {
                font-size: 10px;
                padding: 2px 6px;
                background: var(--sqt-warning);
                color: #000;
                border-radius: 4px;
                margin-left: 6px;
                font-weight: 500;
            }

            .sqt-results-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .sqt-view-toggle {
                display: flex;
                border: 1px solid var(--sqt-border);
                border-radius: 6px;
                overflow: hidden;
            }

            .sqt-view-toggle-btn {
                padding: 4px 10px;
                font-size: 12px;
                font-weight: 500;
                background: var(--sqt-bg-secondary);
                color: var(--sqt-text-secondary);
                border: none;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .sqt-view-toggle-btn:not(:last-child) {
                border-right: 1px solid var(--sqt-border);
            }

            .sqt-view-toggle-btn:hover {
                background: var(--sqt-bg-tertiary);
                color: var(--sqt-text-primary);
            }

            .sqt-view-toggle-btn.active {
                background: var(--sqt-primary);
                color: white;
            }

            .sqt-json-container {
                flex: 1;
                overflow: auto;
                padding: 16px;
                background: var(--sqt-bg-secondary);
            }

            .sqt-json-pre {
                margin: 0;
                padding: 16px;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 6px;
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                line-height: 1.5;
                white-space: pre-wrap;
                word-break: break-word;
                color: var(--sqt-text-primary);
            }

            .sqt-results-container {
                flex: 1;
                overflow: auto;
                padding: 0;
                min-width: 0;
                max-width: 100%;
            }

            .sqt-results-table {
                width: max-content;
                min-width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                font-size: 12px;
            }

            .sqt-results-table th {
                position: sticky;
                top: 0;
                background: var(--sqt-bg-secondary);
                padding: 10px 12px;
                text-align: left;
                font-weight: 600;
                color: var(--sqt-text-secondary);
                border-bottom: 2px solid var(--sqt-border);
                white-space: nowrap;
                z-index: 1;
            }

            .sqt-results-table td {
                padding: 8px 12px;
                border-bottom: 1px solid var(--sqt-border);
                color: var(--sqt-text-primary);
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .sqt-results-table tr:hover td {
                background: var(--sqt-bg-tertiary);
            }

            .sqt-results-table .row-number {
                color: var(--sqt-text-muted);
                text-align: center;
                font-size: 11px;
                background: var(--sqt-bg-secondary);
                width: 50px;
            }

            .sqt-null-value {
                color: var(--sqt-text-muted);
                font-style: italic;
            }

            .sqt-results-table tfoot {
                position: sticky;
                bottom: 0;
                background: var(--sqt-bg-secondary);
                border-top: 2px solid var(--sqt-border);
            }

            .sqt-results-table tfoot td {
                padding: 6px 12px;
                font-size: 10px;
                color: var(--sqt-text-secondary);
                white-space: nowrap;
            }

            .sqt-stats-row td {
                font-weight: 500;
                font-size: 11px;
                background: var(--sqt-bg-secondary) !important;
            }

            .sqt-stats-row td.row-number {
                font-weight: 600;
                color: var(--sqt-primary);
            }

            /* ============================================
               PINNED COLUMNS
               ============================================ */
            .sqt-results-table th.sqt-pinned,
            .sqt-results-table td.sqt-pinned {
                position: sticky !important;
                z-index: 2;
                background: var(--sqt-bg-primary);
            }

            .sqt-results-table th.sqt-pinned {
                z-index: 4;
                background: var(--sqt-bg-secondary);
            }

            .sqt-results-table tr:nth-child(odd) td.sqt-pinned {
                background: var(--sqt-bg-primary);
            }

            .sqt-results-table tr:nth-child(even) td.sqt-pinned {
                background: var(--sqt-bg-secondary);
            }

            .sqt-results-table .sqt-pinned-last {
                border-right: 2px solid var(--sqt-primary) !important;
            }

            .sqt-row-clickable:hover td.sqt-pinned {
                background: var(--sqt-primary) !important;
            }

            .sqt-stats-row td.sqt-pinned {
                background: var(--sqt-bg-secondary) !important;
            }

            .sqt-row-clickable {
                cursor: pointer;
            }

            .sqt-row-clickable:hover td {
                background: var(--sqt-primary) !important;
                color: white !important;
            }

            .sqt-row-clickable:hover .sqt-null-value {
                color: rgba(255,255,255,0.7);
            }

            /* ============================================
               RESULTS MAXIMIZED MODE
               ============================================ */
            .sqt-app.sqt-results-maximized {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                width: 100vw;
                height: 100vh;
                max-width: 100vw;
                max-height: 100vh;
            }

            .sqt-results-maximized .sqt-main {
                height: calc(100vh - 28px); /* Account for status bar */
            }

            .sqt-results-maximized .sqt-toolbar {
                display: none !important;
            }

            .sqt-results-maximized .sqt-editor-panel {
                display: none !important;
            }

            .sqt-results-maximized .sqt-resizer {
                display: none !important;
            }

            .sqt-results-maximized .sqt-nl-bar {
                display: none !important;
            }

            .sqt-results-maximized .sqt-validation-panel {
                display: none !important;
            }

            .sqt-results-maximized .sqt-explain-panel {
                display: none !important;
            }

            .sqt-results-maximized .sqt-optimize-banner {
                display: none !important;
            }

            .sqt-results-maximized .sqt-history-float-btn {
                display: none !important;
            }

            .sqt-results-maximized .sqt-results-panel {
                flex: 1;
                min-height: 0;
            }

            .sqt-results-maximize-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .sqt-results-maximize-btn i {
                transition: transform 0.2s ease;
            }

            .sqt-results-maximized .sqt-results-maximize-btn i {
                transform: rotate(180deg);
            }

            /* ============================================
               DRAG & DROP OVERLAY
               ============================================ */
            .sqt-drop-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(var(--sqt-primary-rgb, 37, 99, 235), 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .sqt-drop-overlay.active {
                opacity: 1;
            }

            .sqt-drop-overlay i {
                font-size: 48px;
                color: white;
                margin-bottom: 16px;
            }

            .sqt-drop-overlay span {
                font-size: 18px;
                color: white;
                font-weight: 500;
            }

            /* ============================================
               COLUMN REORDERING
               ============================================ */
            .sqt-results-table th.sqt-draggable {
                cursor: grab;
                user-select: none;
            }

            .sqt-results-table th.sqt-draggable:active {
                cursor: grabbing;
            }

            .sqt-results-table th.sqt-drag-over {
                background: var(--sqt-primary) !important;
                color: white !important;
            }

            .sqt-results-table th.sqt-dragging {
                opacity: 0.5;
            }

            /* ============================================
               KEYBOARD SHORTCUTS
               ============================================ */
            .sqt-shortcuts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .sqt-shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid var(--sqt-border);
            }

            .sqt-shortcut-keys {
                display: flex;
                gap: 4px;
            }

            .sqt-shortcut-key {
                display: inline-block;
                padding: 4px 8px;
                background: var(--sqt-bg-tertiary);
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                font-family: var(--sqt-editor-font);
                font-size: 11px;
                font-weight: 500;
            }

            /* ============================================
               PARAMETERS MODAL
               ============================================ */
            .sqt-param-input {
                margin-bottom: 12px;
            }

            .sqt-param-input label {
                display: block;
                font-weight: 500;
                margin-bottom: 4px;
                font-family: var(--sqt-editor-font);
            }

            .sqt-param-input input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                font-size: 14px;
                background: var(--sqt-bg-secondary);
                color: var(--sqt-text-primary);
            }

            .sqt-param-input input:focus {
                outline: none;
                border-color: var(--sqt-primary);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }

            /* ============================================
               UNDO/REDO HISTORY
               ============================================ */
            .sqt-history-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 300px;
                max-height: 400px;
                overflow-y: auto;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                display: none;
            }

            .sqt-history-dropdown.show {
                display: block;
            }

            .sqt-history-dropdown-header {
                padding: 12px 16px;
                border-bottom: 1px solid var(--sqt-border);
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .sqt-history-dropdown-item {
                padding: 8px 16px;
                cursor: pointer;
                font-family: var(--sqt-editor-font);
                font-size: 11px;
                border-bottom: 1px solid var(--sqt-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .sqt-history-dropdown-item:hover {
                background: var(--sqt-bg-tertiary);
            }

            .sqt-history-dropdown-item.active {
                background: var(--sqt-primary);
                color: white;
            }

            .sqt-history-dropdown-item-preview {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 8px;
            }

            .sqt-history-dropdown-item-time {
                color: var(--sqt-text-muted);
                font-size: 10px;
            }

            /* ============================================
               TOOLBAR DROPDOWN MENUS
               ============================================ */
            .sqt-toolbar-dropdown-wrapper {
                position: relative;
            }

            .sqt-toolbar-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 180px;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                display: none;
                padding: 4px 0;
                margin-top: 4px;
            }

            .sqt-toolbar-dropdown.show {
                display: block;
            }

            .sqt-toolbar-dropdown-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 16px;
                cursor: pointer;
                font-size: 13px;
                color: var(--sqt-text-primary);
                transition: background 0.15s;
            }

            .sqt-toolbar-dropdown-item:hover {
                background: var(--sqt-bg-tertiary);
            }

            .sqt-toolbar-dropdown-item i {
                font-size: 14px;
                width: 18px;
                text-align: center;
                color: var(--sqt-text-secondary);
            }

            .sqt-toolbar-dropdown-divider {
                height: 1px;
                background: var(--sqt-border);
                margin: 4px 0;
            }

            .sqt-btn-dropdown {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .sqt-btn-dropdown .bi-chevron-down {
                font-size: 10px;
                opacity: 0.7;
            }

            /* ============================================
               RESIZER
               ============================================ */
            .sqt-resizer {
                height: 6px;
                background: var(--sqt-bg-secondary);
                cursor: row-resize;
                display: flex;
                align-items: center;
                justify-content: center;
                border-top: 1px solid var(--sqt-border);
                border-bottom: 1px solid var(--sqt-border);
            }

            .sqt-resizer:hover {
                background: var(--sqt-primary);
            }

            .sqt-resizer-handle {
                width: 40px;
                height: 3px;
                background: var(--sqt-border);
                border-radius: 2px;
            }

            .sqt-resizer:hover .sqt-resizer-handle {
                background: white;
            }

            /* ============================================
               STATUS BAR
               ============================================ */
            .sqt-statusbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 4px 16px;
                background: var(--sqt-bg-secondary);
                border-top: 1px solid var(--sqt-border);
                font-size: 11px;
                color: var(--sqt-text-muted);
                flex-shrink: 0;
            }

            .sqt-statusbar-left,
            .sqt-statusbar-right,
            .sqt-statusbar-center {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .sqt-statusbar-center {
                gap: 8px;
            }

            .sqt-statusbar-separator {
                color: var(--sqt-border);
            }

            .sqt-statusbar a {
                color: var(--sqt-text-muted);
                text-decoration: none;
            }

            .sqt-statusbar a:hover {
                color: var(--sqt-primary);
                text-decoration: underline;
            }

            .sqt-status-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .sqt-status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--sqt-success);
            }

            .sqt-status-dot.running {
                background: var(--sqt-warning);
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* ============================================
               LOADING STATE
               ============================================ */
            .sqt-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px;
                color: var(--sqt-text-secondary);
            }

            .sqt-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid var(--sqt-border);
                border-top-color: var(--sqt-primary);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin-bottom: 12px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* ============================================
               EMPTY STATE
               ============================================ */
            .sqt-empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px;
                color: var(--sqt-text-secondary);
                text-align: center;
            }

            .sqt-empty-state i {
                font-size: 48px;
                color: var(--sqt-text-muted);
                margin-bottom: 16px;
            }

            .sqt-empty-state h3 {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
                color: var(--sqt-text-primary);
            }

            .sqt-empty-state p {
                font-size: 13px;
                margin: 0;
            }

            /* ============================================
               TOAST NOTIFICATIONS
               ============================================ */
            .sqt-toast-container {
                position: fixed;
                top: 16px;
                right: 16px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .sqt-toast {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 16px;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                min-width: 300px;
                max-width: 400px;
                animation: slideIn 0.2s ease;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .sqt-toast-icon {
                font-size: 18px;
                flex-shrink: 0;
            }

            .sqt-toast-success .sqt-toast-icon { color: var(--sqt-success); }
            .sqt-toast-error .sqt-toast-icon { color: var(--sqt-danger); }
            .sqt-toast-warning .sqt-toast-icon { color: var(--sqt-warning); }
            .sqt-toast-info .sqt-toast-icon { color: var(--sqt-primary); }

            .sqt-toast-content {
                flex: 1;
            }

            .sqt-toast-title {
                font-weight: 600;
                font-size: 13px;
                margin-bottom: 2px;
            }

            .sqt-toast-message {
                font-size: 12px;
                color: var(--sqt-text-secondary);
            }

            .sqt-toast-close {
                background: none;
                border: none;
                color: var(--sqt-text-muted);
                cursor: pointer;
                padding: 0;
                font-size: 16px;
            }

            .sqt-toast-close:hover {
                color: var(--sqt-text-primary);
            }

            /* ============================================
               MODALS
               ============================================ */
            .modal-content {
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
            }

            .modal-header {
                border-bottom-color: var(--sqt-border);
            }

            .modal-footer {
                border-top-color: var(--sqt-border);
            }

            /* ============================================
               OPTIONS PANEL
               ============================================ */
            .sqt-options-panel {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 16px;
                min-width: 280px;
                z-index: 100;
                display: none;
            }

            .sqt-options-panel.show {
                display: block;
            }

            .sqt-options-section {
                margin-bottom: 16px;
            }

            .sqt-options-section:last-child {
                margin-bottom: 0;
            }

            .sqt-options-label {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--sqt-text-secondary);
                margin-bottom: 8px;
            }

            .sqt-option-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .sqt-option-row input[type="number"] {
                width: 80px;
                padding: 4px 8px;
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                background: var(--sqt-bg-secondary);
                color: var(--sqt-text-primary);
                font-size: 12px;
            }

            .sqt-option-row label {
                font-size: 12px;
                color: var(--sqt-text-primary);
            }

            /* ============================================
               KEYBOARD SHORTCUTS
               ============================================ */
            .sqt-kbd {
                display: inline-flex;
                align-items: center;
                padding: 2px 6px;
                font-family: var(--sqt-editor-font);
                font-size: 11px;
                background: var(--sqt-bg-tertiary);
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                color: var(--sqt-text-secondary);
            }

            /* ============================================
               FOCUS MODE
               ============================================ */
            .sqt-app.sqt-focus-mode {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                width: 100vw;
                height: 100vh;
                max-width: 100vw;
                max-height: 100vh;
            }

            .sqt-focus-mode .sqt-main {
                height: calc(100vh - 28px); /* Account for status bar */
            }

            /* Ensure modals appear above focus mode */
            .modal {
                z-index: 100000 !important;
            }

            .modal-backdrop {
                z-index: 99999 !important;
            }

            /* Row Details Panel */
            .sqt-row-details {
                max-height: 400px;
                overflow-y: auto;
            }

            .sqt-row-details-table {
                width: 100%;
                font-size: 13px;
            }

            .sqt-row-details-table th {
                text-align: right;
                padding: 6px 12px 6px 6px;
                color: var(--sqt-text-secondary);
                font-weight: 500;
                width: 40%;
                vertical-align: top;
                border-bottom: 1px solid var(--sqt-border);
            }

            .sqt-row-details-table td {
                padding: 6px;
                color: var(--sqt-text-primary);
                word-break: break-word;
                border-bottom: 1px solid var(--sqt-border);
            }

            /* Execution Time Chart */
            .sqt-time-chart {
                display: flex;
                align-items: flex-end;
                gap: 2px;
                height: 40px;
                padding: 4px 0;
            }

            .sqt-time-bar {
                flex: 1;
                min-width: 8px;
                max-width: 20px;
                background: var(--sqt-primary);
                border-radius: 2px 2px 0 0;
                opacity: 0.6;
                transition: opacity 0.15s;
            }

            .sqt-time-bar:hover {
                opacity: 1;
            }

            .sqt-time-bar:last-child {
                opacity: 1;
            }

            /* Share URL */
            .sqt-share-url {
                font-family: var(--sqt-editor-font);
                font-size: 11px;
                padding: 8px;
                background: var(--sqt-bg-secondary);
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                word-break: break-all;
                max-height: 100px;
                overflow-y: auto;
            }

            /* Autocomplete */
            .CodeMirror-hints {
                z-index: 100001 !important;
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-height: 200px;
                overflow-y: auto;
            }

            .CodeMirror-hint {
                padding: 4px 8px;
                color: var(--sqt-text-primary);
            }

            .CodeMirror-hint-active {
                background: var(--sqt-primary);
                color: white;
            }

            /* ============================================
               AI QUERY GENERATOR
               ============================================ */
            .sqt-ai-modal .modal-content {
                height: 80vh;
                max-height: 700px;
            }

            .sqt-ai-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                margin-right: 16px;
            }

            .sqt-ai-header-controls {
                display: flex;
                gap: 8px;
            }

            .sqt-ai-body {
                flex: 1;
                overflow-y: auto;
                padding: 0;
                background: var(--sqt-bg-secondary);
            }

            .sqt-ai-messages {
                min-height: 100%;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .sqt-ai-welcome {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px 24px;
                text-align: center;
                color: var(--sqt-text-secondary);
            }

            .sqt-ai-welcome i {
                font-size: 48px;
                color: var(--sqt-primary);
                margin-bottom: 16px;
            }

            .sqt-ai-welcome h4 {
                font-size: 18px;
                font-weight: 600;
                color: var(--sqt-text-primary);
                margin-bottom: 8px;
            }

            .sqt-ai-welcome p {
                font-size: 14px;
                margin-bottom: 24px;
            }

            .sqt-ai-examples {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-width: 400px;
            }

            .sqt-ai-example {
                padding: 12px 16px;
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                background: var(--sqt-bg-primary);
                color: var(--sqt-text-primary);
                font-size: 13px;
                text-align: left;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .sqt-ai-example:hover {
                border-color: var(--sqt-primary);
                background: var(--sqt-bg-tertiary);
            }

            .sqt-ai-message {
                display: flex;
                gap: 12px;
                max-width: 85%;
            }

            .sqt-ai-message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            .sqt-ai-message.assistant {
                align-self: flex-start;
            }

            .sqt-ai-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 14px;
            }

            .sqt-ai-message.user .sqt-ai-avatar {
                background: var(--sqt-primary);
                color: white;
            }

            .sqt-ai-message.assistant .sqt-ai-avatar {
                background: var(--sqt-bg-tertiary);
                color: var(--sqt-text-primary);
            }

            .sqt-ai-content {
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 12px;
                padding: 12px 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .sqt-ai-message.user .sqt-ai-content {
                background: var(--sqt-primary);
                color: white;
                border-color: var(--sqt-primary);
            }

            .sqt-ai-content pre {
                background: var(--sqt-bg-tertiary) !important;
                border: 1px solid var(--sqt-border) !important;
                border-radius: 8px;
                padding: 12px;
                margin: 12px 0;
                overflow-x: auto;
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                color: var(--sqt-text-primary) !important;
            }

            .sqt-ai-content pre code {
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                background: transparent !important;
                color: var(--sqt-text-primary) !important;
                padding: 0;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .sqt-ai-content code {
                font-family: var(--sqt-editor-font);
                font-size: 12px;
                background: var(--sqt-bg-tertiary);
                padding: 2px 6px;
                border-radius: 4px;
            }

            .sqt-ai-timestamp {
                font-size: 10px;
                color: var(--sqt-text-muted);
                margin-top: 8px;
                text-align: right;
            }

            .sqt-ai-message.user .sqt-ai-timestamp {
                color: rgba(255, 255, 255, 0.7);
            }

            .sqt-ai-query-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .sqt-ai-footer {
                padding: 16px;
                border-top: 1px solid var(--sqt-border);
                background: var(--sqt-bg-primary);
            }

            .sqt-ai-input-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
            }

            .sqt-ai-input {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                background: var(--sqt-bg-secondary);
                color: var(--sqt-text-primary);
                font-family: inherit;
                font-size: 14px;
                resize: none;
            }

            .sqt-ai-input:focus {
                outline: none;
                border-color: var(--sqt-primary);
            }

            .sqt-ai-input-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .sqt-ai-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--sqt-text-secondary);
            }

            .sqt-ai-toggle input {
                margin: 0;
            }

            .sqt-ai-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: var(--sqt-bg-primary);
                border: 1px solid var(--sqt-border);
                border-radius: 12px;
                color: var(--sqt-text-secondary);
                font-size: 14px;
            }

            .sqt-ai-loading .sqt-spinner {
                width: 16px;
                height: 16px;
                border-width: 2px;
                margin: 0;
            }

            .sqt-ai-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid var(--sqt-danger);
                border-radius: 8px;
                padding: 12px 16px;
                color: var(--sqt-danger);
                font-size: 13px;
            }

            .sqt-ai-error i {
                margin-right: 8px;
            }

            #aiApiKey {
                font-family: var(--sqt-editor-font);
            }

            /* ============================================
               AI ENHANCED FEATURES
               ============================================ */

            /* Natural Language Query Bar */
            .sqt-nl-bar {
                display: flex;
                gap: 8px;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05));
                border-bottom: 1px solid var(--sqt-border);
            }

            .sqt-nl-bar.hidden {
                display: none;
            }

            .sqt-nl-input {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid var(--sqt-border);
                border-radius: 8px;
                background: var(--sqt-bg-primary);
                color: var(--sqt-text-primary);
                font-size: 13px;
            }

            .sqt-nl-input:focus {
                outline: none;
                border-color: var(--sqt-primary);
            }

            .sqt-nl-input::placeholder {
                color: var(--sqt-text-muted);
            }

            .sqt-nl-btn {
                padding: 10px 16px;
                background: var(--sqt-primary);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: background 0.15s;
                white-space: nowrap;
            }

            .sqt-nl-btn:hover {
                background: var(--sqt-primary-hover);
            }

            .sqt-nl-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .sqt-nl-toggle {
                padding: 6px 10px;
                background: transparent;
                border: 1px solid var(--sqt-border);
                border-radius: 6px;
                color: var(--sqt-text-secondary);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.15s;
            }

            .sqt-nl-toggle:hover {
                background: var(--sqt-bg-tertiary);
            }

            .sqt-nl-toggle.active {
                background: var(--sqt-primary);
                border-color: var(--sqt-primary);
                color: white;
            }

            /* Query Validation Panel */
            .sqt-validation-panel {
                display: none;
                padding: 12px 16px;
                background: rgba(245, 158, 11, 0.1);
                border-bottom: 1px solid rgba(245, 158, 11, 0.3);
            }

            .sqt-validation-panel.visible {
                display: block;
            }

            .sqt-validation-panel.error {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .sqt-validation-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .sqt-validation-title {
                font-weight: 600;
                font-size: 13px;
                color: var(--sqt-warning);
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .sqt-validation-panel.error .sqt-validation-title {
                color: var(--sqt-danger);
            }

            .sqt-validation-content {
                font-size: 13px;
                color: var(--sqt-text-primary);
                line-height: 1.5;
            }

            .sqt-validation-content ul {
                margin: 8px 0 0 0;
                padding-left: 20px;
            }

            .sqt-validation-content li {
                margin-bottom: 4px;
            }

            .sqt-validation-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            /* Optimization Suggestion Banner */
            .sqt-optimize-banner {
                display: none;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1));
                border-bottom: 1px solid rgba(37, 99, 235, 0.2);
            }

            .sqt-optimize-banner.visible {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .sqt-optimize-message {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--sqt-text-primary);
            }

            .sqt-optimize-message i {
                color: var(--sqt-primary);
                font-size: 16px;
            }

            .sqt-optimize-actions {
                display: flex;
                gap: 8px;
            }

            /* Explain Query Panel */
            .sqt-explain-panel {
                display: none;
                padding: 16px;
                background: var(--sqt-bg-secondary);
                border-bottom: 1px solid var(--sqt-border);
                max-height: 300px;
                overflow-y: auto;
            }

            .sqt-explain-panel.visible {
                display: block;
            }

            .sqt-explain-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .sqt-explain-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--sqt-text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .sqt-explain-title i {
                color: var(--sqt-primary);
            }

            .sqt-explain-content {
                font-size: 13px;
                line-height: 1.6;
                color: var(--sqt-text-primary);
            }

            .sqt-explain-content ul {
                margin: 8px 0;
                padding-left: 20px;
            }

            .sqt-explain-content li {
                margin-bottom: 6px;
            }

            .sqt-explain-content code {
                background: var(--sqt-bg-tertiary);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
            }

            .sqt-explain-content strong {
                color: var(--sqt-primary);
            }

            /* ============================================
               RESPONSIVE ADJUSTMENTS
               ============================================ */
            @media (max-width: 768px) {
                .sqt-sidebar {
                    display: none;
                }

                .sqt-toolbar {
                    padding: 8px;
                }

                .sqt-btn span {
                    display: none;
                }
            }
        </style>
    `;
}

/**
 * Generates the toast notification container.
 * @returns {string} HTML for toast container
 */
function generateToastContainer() {
    return `<div id="toastContainer" class="sqt-toast-container"></div>`;
}

/**
 * Generates the main application layout.
 * @param {string} scriptUrl - The script URL
 * @returns {string} HTML for main layout
 */
function generateMainLayout(scriptUrl, remoteAccounts) {
    return `
        <div class="sqt-app">
            <div class="sqt-main">
                ${generateSidebar()}
                <div class="sqt-content">
                    <!-- Floating History Button -->
                    <button type="button" class="sqt-history-float-btn" onclick="SQT.toggleSidebar()" title="Toggle query history">
                        <i class="bi bi-clock-history"></i>
                    </button>
                    
                   
                    ${generateToolbar(scriptUrl, remoteAccounts)}

                    <!-- Natural Language Query Bar -->
                    <div class="sqt-nl-bar" id="nlQueryBar">
                        <input type="text" class="sqt-nl-input" id="nlQueryInput"
                               placeholder="Describe what you want in plain English... (e.g., 'Show me overdue invoices over $1000')"
                               onkeydown="if(event.key==='Enter') SQT.generateFromNaturalLanguage()">
                        <button type="button" class="sqt-nl-btn" onclick="SQT.generateFromNaturalLanguage()" id="nlGenerateBtn">
                            <i class="bi bi-stars"></i>
                            <span>Generate</span>
                        </button>
                        <button type="button" class="sqt-nl-toggle" onclick="SQT.toggleNLBar()" title="Hide natural language bar">
                            <i class="bi bi-chevron-up"></i>
                        </button>
                    </div>

                    <!-- Validation Panel -->
                    <div class="sqt-validation-panel" id="validationPanel">
                        <div class="sqt-validation-header">
                            <div class="sqt-validation-title">
                                <i class="bi bi-exclamation-triangle"></i>
                                <span id="validationTitle">Query Review</span>
                            </div>
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideValidation()">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                        <div class="sqt-validation-content" id="validationContent"></div>
                        <div class="sqt-validation-actions" id="validationActions"></div>
                    </div>

                    <!-- Explain Query Panel -->
                    <div class="sqt-explain-panel" id="explainPanel">
                        <div class="sqt-explain-header">
                            <div class="sqt-explain-title">
                                <i class="bi bi-lightbulb"></i>
                                <span>Query Explanation</span>
                            </div>
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideExplain()">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                        <div class="sqt-explain-content" id="explainContent">
                            <div class="sqt-loading">
                                <div class="sqt-spinner"></div>
                                <span>Analyzing query...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Optimization Suggestion Banner -->
                    <div class="sqt-optimize-banner" id="optimizeBanner">
                        <div class="sqt-optimize-message">
                            <i class="bi bi-lightning-charge"></i>
                            <span id="optimizeMessage">This query took a while. Would you like AI to suggest optimizations?</span>
                        </div>
                        <div class="sqt-optimize-actions">
                            <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm" onclick="SQT.askAIToOptimize()">
                                <i class="bi bi-stars"></i> Optimize
                            </button>
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideOptimizeBanner()">
                                Dismiss
                            </button>
                        </div>
                    </div>

                    <div class="sqt-editor-panel" style="position: relative;">
                        <div class="sqt-editor-container">
                            <textarea id="queryEditor"></textarea>
                        </div>
                        <div class="sqt-drop-overlay" id="dropOverlay">
                            <i class="bi bi-file-earmark-code"></i>
                            <span>Drop SQL file here</span>
                        </div>
                    </div>
                    <div class="sqt-resizer" id="resizer">
                        <div class="sqt-resizer-handle"></div>
                    </div>
                    <div class="sqt-results-panel" id="resultsPanel">
                        ${generateEmptyState()}
                    </div>
                </div>
            </div>
            ${generateStatusBar()}
        </div>
    `;
}

/**
 * Generates the header section.
 * @returns {string} HTML for header
 */
function generateHeader() {
    return `
        <header class="sqt-header">
            <div class="sqt-header-title">
                <i class="bi bi-database"></i>
                <span>SuiteQL Query Tool</span>
                <span style="font-weight: 400; color: var(--sqt-text-muted); font-size: 12px;">v${CONFIG.VERSION}</span>
            </div>
            <div class="sqt-header-actions">
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="SQT.toggleSidebar()" title="Toggle query history">
                    <i class="bi bi-layout-sidebar" id="sidebarIcon"></i>
                </button>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="SQT.toggleTheme()" title="Toggle dark mode">
                    <i class="bi bi-moon-stars" id="themeIcon"></i>
                </button>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="SQT.showHelp()" title="Help">
                    <i class="bi bi-question-circle"></i>
                </button>
            </div>
        </header>
    `;
}

/**
 * Generates the sidebar with query history.
 * @returns {string} HTML for sidebar
 */
function generateSidebar() {
    return `
        <aside class="sqt-sidebar collapsed" id="sidebar">
            <div class="sqt-sidebar-header">
                <span class="sqt-sidebar-title">Query History</span>
                <div style="display: flex; gap: 4px;">
                    <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon sqt-btn-sm" onclick="SQT.clearHistory()" title="Clear history">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon sqt-btn-sm" onclick="SQT.toggleSidebar()" title="Close history">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
            <div class="sqt-history-list" id="historyList">
                <div class="sqt-empty-state" style="padding: 24px;">
                    <i class="bi bi-clock-history" style="font-size: 24px;"></i>
                    <p style="margin-top: 8px;">No query history yet</p>
                </div>
            </div>
        </aside>
    `;
}

/**
 * Generates the toolbar section.
 * @param {string} scriptUrl - The script URL
 * @returns {string} HTML for toolbar
 */
function generateToolbar(scriptUrl, remoteAccounts) {
    const localLibraryButtons = CONFIG.QUERY_FOLDER_ID ? `
        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.showLocalLibrary()">
            <i class="bi bi-folder"></i>
            <span>Local Library</span>
        </button>
        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.showSaveModal()">
            <i class="bi bi-save"></i>
            <span>Save</span>
        </button>
    ` : '';

    const workbooksButton = CONFIG.WORKBOOKS_ENABLED ? `
        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.showWorkbooks()">
            <i class="bi bi-journal-text"></i>
            <span>Workbooks</span>
        </button>
    ` : '';

    return `
        <div class="sqt-toolbar">
            <div class="sqt-toolbar-group">
            
                <div class="sqt-toolbar-dropdown-wrapper" id="toolbarRun">
                    <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm sqt-btn-dropdown"
                        onclick="SQT.toggleRunDropdown()" title="Run Query" id="runButton">
                        <i class="bi bi-play-fill"></i>
                        <span>Run</span>
                        <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="sqt-toolbar-dropdown" id="runDropdown">
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.runQuery(null); SQT.closeAllDropdowns();">
                            <i class="bi bi-database-check"></i>
                            <span>This Account</span>
                        </div>
                        ${remoteAccounts.map(acc =>
        `<div class="sqt-toolbar-dropdown-item" onclick="SQT.runQuery('${acc.url}'); SQT.closeAllDropdowns();">
                            <i class="bi bi-database-check"></i>
                            <span>${acc.description}<br><small>${acc.account}</small></span>
                        </div>`
    ).join('')}
                    </div>
                </div>

                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.formatQuery()" id="toolbarFormat">
                    <i class="bi bi-code-slash"></i>
                    <span>Format</span>
                </button>
                <div class="sqt-toolbar-dropdown-wrapper" id="toolbarAI">
                    <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-dropdown" onclick="SQT.toggleAIDropdown()" title="AI-powered features">
                        <i class="bi bi-robot"></i>
                        <span>AI</span>
                        <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="sqt-toolbar-dropdown" id="aiDropdown">
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.showAIModal(); SQT.closeAllDropdowns();">
                            <i class="bi bi-chat-dots"></i>
                            <span>AI Chat</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.toggleNLBar(); SQT.closeAllDropdowns();">
                            <i class="bi bi-chat-text"></i>
                            <span>Quick Ask Bar</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-divider"></div>
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.explainQuery(); SQT.closeAllDropdowns();">
                            <i class="bi bi-lightbulb"></i>
                            <span>Explain Query</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.validateQuery(); SQT.closeAllDropdowns();">
                            <i class="bi bi-shield-check"></i>
                            <span>Validate Query</span>
                        </div>
                    </div>
                </div>
                <div class="sqt-toolbar-dropdown-wrapper" id="toolbarMore">
                    <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-dropdown" onclick="SQT.toggleMoreDropdown()" title="More actions">
                        <i class="bi bi-three-dots"></i>
                        <span>More</span>
                        <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="sqt-toolbar-dropdown" id="moreDropdown">
                        ${CONFIG.REMOTE_LIBRARY_ENABLED ? `
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.showRemoteLibrary(); SQT.closeAllDropdowns();">
                            <i class="bi bi-collection"></i>
                            <span>Query Library</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-divider"></div>
                        ` : ''}
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.showShareModal(); SQT.closeAllDropdowns();">
                            <i class="bi bi-share"></i>
                            <span>Share Query</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-divider"></div>
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.importSqlFile(); SQT.closeAllDropdowns();">
                            <i class="bi bi-upload"></i>
                            <span>Import SQL File</span>
                        </div>
                        <div class="sqt-toolbar-dropdown-item" onclick="SQT.downloadQuery(); SQT.closeAllDropdowns();">
                            <i class="bi bi-download"></i>
                            <span>Download SQL File</span>
                        </div>
                    </div>
                </div>
                <input type="file" id="sqlFileInput" accept=".sql,.txt" style="display: none;" onchange="SQT.handleFileSelect(event)">
            </div>

            <div class="sqt-toolbar-divider" id="toolbarTablesDivider"></div>

            <div class="sqt-toolbar-group" id="toolbarTablesGroup">
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.openTablesReference()">
                    <i class="bi bi-table"></i>
                    <span>Tables</span>
                </button>
                ${localLibraryButtons}
                ${workbooksButton}
            </div>

            <div style="flex: 1;"></div>

            <div class="sqt-toolbar-group" style="position: relative;">
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.toggleOptions()" title="Query options">
                    <i class="bi bi-gear"></i>
                </button>
                ${generateOptionsPanel()}
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.showUndoHistory()" title="Edit history">
                    <i class="bi bi-clock-history"></i>
                </button>
                <div class="sqt-history-dropdown" id="undoHistoryDropdown">
                    <div class="sqt-history-dropdown-header">
                        <span>Edit History</span>
                        <button type="button" class="btn btn-sm btn-link p-0" onclick="SQT.closeUndoHistory()">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                    <div id="undoHistoryList"></div>
                </div>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.toggleFocusMode()" title="Toggle focus mode (hide NetSuite chrome)">
                    <i class="bi bi-arrows-fullscreen" id="focusModeIcon"></i>
                </button>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.toggleSidebar()" title="Toggle query history">
                    <i class="bi bi-layout-sidebar-inset" id="sidebarIcon"></i>
                </button>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.toggleTheme()" title="Toggle dark mode">
                    <i class="bi bi-moon-stars" id="themeIcon"></i>
                </button>
                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.showShortcuts()" title="Keyboard shortcuts (?)">
                    <i class="bi bi-question-circle"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Generates the options dropdown panel.
 * @returns {string} HTML for options panel
 */
function generateOptionsPanel() {
    return `
        <div class="sqt-options-panel" id="optionsPanel">
            <div class="sqt-options-section">
                <div class="sqt-options-label">Pagination</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optPagination" onchange="SQT.updateOptions()">
                    <label for="optPagination">Enable pagination</label>
                </div>
                <div class="sqt-option-row" id="rowRangeOptions" style="display: none;">
                    <span style="font-size: 12px;">Rows:</span>
                    <input type="number" id="optRowBegin" value="1" min="1">
                    <span style="font-size: 12px;">to</span>
                    <input type="number" id="optRowEnd" value="${CONFIG.ROWS_RETURNED_DEFAULT}">
                </div>
                <div class="sqt-option-row" id="returnAllOption" style="display: none;">
                    <input type="checkbox" id="optReturnAll" onchange="SQT.updateOptions()">
                    <label for="optReturnAll">Return all rows</label>
                </div>
                <div class="sqt-option-row" id="showTotalsOption" style="display: none;">
                    <input type="checkbox" id="optShowTotals">
                    <label for="optShowTotals">Show total row count</label>
                </div>
            </div>

            <div class="sqt-options-section">
                <div class="sqt-options-label">Display</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optHideRowNumbers" onchange="SQT.refreshResults()">
                    <label for="optHideRowNumbers">Hide row numbers</label>
                </div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optShowStats" onchange="SQT.refreshResults()">
                    <label for="optShowStats">Show column statistics</label>
                </div>
                <div class="sqt-option-row" style="margin-top: 8px;">
                    <label for="optPinColumns" style="font-size: 12px; margin-right: 8px;">Pin columns:</label>
                    <select id="optPinColumns" onchange="SQT.refreshResults()" style="padding: 4px 8px; border: 1px solid var(--sqt-border); border-radius: 4px; background: var(--sqt-bg-secondary); color: var(--sqt-text-primary); font-size: 12px;">
                        <option value="0">None</option>
                        <option value="1">First 1</option>
                        <option value="2">First 2</option>
                        <option value="3">First 3</option>
                    </select>
                </div>
            </div>

            <div class="sqt-options-section">
                <div class="sqt-options-label">NULL Values</div>
                <div class="sqt-option-row">
                    <select id="optNullDisplay" onchange="SQT.refreshResults()" style="width: 100%; padding: 4px 8px; border: 1px solid var(--sqt-border); border-radius: 4px; background: var(--sqt-bg-secondary); color: var(--sqt-text-primary); font-size: 12px;">
                        <option value="dimmed">Show dimmed</option>
                        <option value="null">Show "null"</option>
                        <option value="blank">Show blank</option>
                    </select>
                </div>
            </div>

            <div class="sqt-options-section">
                <div class="sqt-options-label">Editor</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optAutocomplete" onchange="SQT.toggleAutocomplete()">
                    <label for="optAutocomplete">Enable table/column autocomplete</label>
                </div>
                <div class="sqt-option-row" style="margin-top: 8px;">
                    <label for="optFontSize" style="font-size: 12px; margin-right: 8px;">Font size:</label>
                    <select id="optFontSize" onchange="SQT.changeEditorFontSize()" style="padding: 4px 8px; border: 1px solid var(--sqt-border); border-radius: 4px; background: var(--sqt-bg-secondary); color: var(--sqt-text-primary); font-size: 12px;">
                        <option value="10">Extra Small (10px)</option>
                        <option value="11">Small (11px)</option>
                        <option value="12" selected>Medium (12px)</option>
                        <option value="14">Large (14px)</option>
                        <option value="16">Extra Large (16px)</option>
                    </select>
                </div>
            </div>

            <div class="sqt-options-section">
                <div class="sqt-options-label">Toolbar</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optCompactToolbar" onchange="SQT.toggleCompactToolbar()">
                    <label for="optCompactToolbar">Compact mode (icons only)</label>
                </div>
                <div class="sqt-options-label" style="margin-top: 12px; font-size: 10px;">Show/Hide Items</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optShowFormat" checked onchange="SQT.updateToolbarVisibility()">
                    <label for="optShowFormat">Format</label>
                </div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optShowAI" checked onchange="SQT.updateToolbarVisibility()">
                    <label for="optShowAI">AI</label>
                </div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optShowMore" checked onchange="SQT.updateToolbarVisibility()">
                    <label for="optShowMore">More</label>
                </div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optShowTables" checked onchange="SQT.updateToolbarVisibility()">
                    <label for="optShowTables">Tables</label>
                </div>
            </div>

            ${CONFIG.QUERY_FOLDER_ID ? `
            <div class="sqt-options-section">
                <div class="sqt-options-label">Virtual Views</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optEnableViews" checked>
                    <label for="optEnableViews">Enable virtual views</label>
                </div>
            </div>
            ` : ''}

            <div class="sqt-options-section">
                <div class="sqt-options-label">Advanced</div>
                <div class="sqt-option-row">
                    <input type="checkbox" id="optDisableCache">
                    <label for="optDisableCache" title="Injects a unique identifier into each query to bypass Oracle's query cache, ensuring fresh results from the database. Helpful when benchmarking query performance to ensure caching isn't impacting execution times.">Force cache miss</label>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates the empty state for results panel.
 * @returns {string} HTML for empty state
 */
function generateEmptyState() {
    return `
        <div class="sqt-empty-state" id="emptyState">
            <i class="bi bi-terminal"></i>
            <h3>Ready to query</h3>
            <p>Write a SuiteQL query above and click <strong>Run Query</strong> or press <span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">Enter</span></p>
        </div>
    `;
}

/**
 * Generates the status bar.
 * @returns {string} HTML for status bar
 */
function generateStatusBar() {
    return `
        <footer class="sqt-statusbar">
            <div class="sqt-statusbar-left">
                <div class="sqt-status-indicator">
                    <div class="sqt-status-dot" id="statusDot"></div>
                    <span id="statusText">Ready</span>
                </div>
            </div>
            <div class="sqt-statusbar-center">
                <span>SuiteQL Query Tool v${CONFIG.VERSION}</span>
                <span class="sqt-statusbar-separator">|</span>
                <span>Developed by <a href="https://timdietrich.me" target="_blank" rel="noopener">Tim Dietrich</a></span>
            </div>
            <div class="sqt-statusbar-right">
                <span id="cursorPosition">Ln 1, Col 1</span>
            </div>
        </footer>
    `;
}

/**
 * Generates modal dialogs.
 * @returns {string} HTML for modals
 */
function generateModals() {
    return `
        <!-- Local Library Modal -->
        <div class="modal fade" id="localLibraryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Local Query Library</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="localLibraryContent">
                        <div class="sqt-loading">
                            <div class="sqt-spinner"></div>
                            <span>Loading queries...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remote Library Modal -->
        <div class="modal fade" id="remoteLibraryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">SuiteQL Query Library</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="remoteLibraryContent">
                        <div class="sqt-loading">
                            <div class="sqt-spinner"></div>
                            <span>Loading query library...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Query Modal -->
        <div class="modal fade" id="saveModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Save Query</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="saveFileName" class="form-label">File Name</label>
                            <input type="text" class="form-control" id="saveFileName" placeholder="my-query.sql">
                        </div>
                        <div class="mb-3">
                            <label for="saveDescription" class="form-label">Description</label>
                            <input type="text" class="form-control" id="saveDescription" placeholder="Optional description">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="SQT.saveQuery()">Save Query</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Workbooks Modal -->
        <div class="modal fade" id="workbooksModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Workbooks</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="workbooksContent">
                        <div class="sqt-loading">
                            <div class="sqt-spinner"></div>
                            <span>Loading workbooks...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Help Modal -->
        <div class="modal fade" id="helpModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Keyboard Shortcuts</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <td><span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">Enter</span></td>
                                    <td>Run query</td>
                                </tr>
                                <tr>
                                    <td><span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">S</span></td>
                                    <td>Save query</td>
                                </tr>
                                <tr>
                                    <td><span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">Shift</span> + <span class="sqt-kbd">F</span></td>
                                    <td>Format query</td>
                                </tr>
                                <tr>
                                    <td><span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">/</span></td>
                                    <td>Toggle comment</td>
                                </tr>
                                <tr>
                                    <td><span class="sqt-kbd">Esc</span></td>
                                    <td>Exit focus mode</td>
                                </tr>
                            </tbody>
                        </table>
                        <hr>
                        <p class="text-muted small mb-0">
                            SuiteQL Query Tool v${CONFIG.VERSION}<br>
                            Developed by <a href="https://timdietrich.me" target="_blank">Tim Dietrich</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Export Options Modal -->
        <div class="modal fade" id="exportModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Export Results</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-grid gap-2">
                            <button type="button" class="btn btn-outline-primary" onclick="SQT.exportAs('xlsx')">
                                <i class="bi bi-file-earmark-excel me-2"></i>Export as Excel (.xlsx)
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="SQT.exportAs('csv')">
                                <i class="bi bi-filetype-csv me-2"></i>Export as CSV
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="SQT.exportAs('json')">
                                <i class="bi bi-filetype-json me-2"></i>Export as JSON
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="SQT.copyToClipboard()">
                                <i class="bi bi-clipboard me-2"></i>Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Row Details Modal -->
        <div class="modal fade" id="rowDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Row Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body sqt-row-details" id="rowDetailsContent">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="SQT.prevRow()">
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <span class="mx-2" id="rowDetailsIndex">Row 1 of 1</span>
                        <button type="button" class="btn btn-secondary" onclick="SQT.nextRow()">
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Share Query Modal -->
        <div class="modal fade" id="shareModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Share Query</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted small">Copy this URL to share your query. Anyone with access to this tool can open it.</p>
                        <div class="sqt-share-url" id="shareUrl"></div>
                        <button type="button" class="btn btn-primary mt-3 w-100" onclick="SQT.copyShareUrl()">
                            <i class="bi bi-clipboard me-2"></i>Copy URL
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Keyboard Shortcuts Modal -->
        <div class="modal fade" id="shortcutsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-keyboard me-2"></i>Keyboard Shortcuts</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="sqt-shortcuts-grid">
                            <div>
                                <h6 class="mb-3">Query Execution</h6>
                                <div class="sqt-shortcut-item">
                                    <span>Run Query</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">Enter</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Format Query</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">Shift</span>
                                        <span class="sqt-shortcut-key">F</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Save Query</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">S</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h6 class="mb-3">Editor</h6>
                                <div class="sqt-shortcut-item">
                                    <span>Undo</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">Z</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Redo</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">Shift</span>
                                        <span class="sqt-shortcut-key">Z</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Autocomplete</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Ctrl</span>
                                        <span class="sqt-shortcut-key">Space</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h6 class="mb-3">Navigation</h6>
                                <div class="sqt-shortcut-item">
                                    <span>Maximize Results</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Shift</span>
                                        <span class="sqt-shortcut-key">R</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Exit Focus/Maximized</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">Esc</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Previous Row (in details)</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">←</span>
                                    </div>
                                </div>
                                <div class="sqt-shortcut-item">
                                    <span>Next Row (in details)</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">→</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h6 class="mb-3">Other</h6>
                                <div class="sqt-shortcut-item">
                                    <span>Show Shortcuts</span>
                                    <div class="sqt-shortcut-keys">
                                        <span class="sqt-shortcut-key">?</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 text-muted small">
                            <i class="bi bi-info-circle me-1"></i>
                            On Mac, use <span class="sqt-shortcut-key">Cmd</span> instead of <span class="sqt-shortcut-key">Ctrl</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Parameters Modal -->
        <div class="modal fade" id="parametersModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-input-cursor-text me-2"></i>Query Parameters</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="parametersContent">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="SQT.runWithParameters()">
                            <i class="bi bi-play-fill me-1"></i>Run Query
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Assistant Modal -->
        <div class="modal fade sqt-ai-modal" id="aiModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="sqt-ai-header">
                            <h5 class="modal-title" style="font-size: 18px; font-weight: 600;">
                                <i class="bi bi-robot me-2"></i>AI Assistant
                            </h5>
                            <div class="sqt-ai-header-controls">
                                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm"
                                        onclick="SQT.clearAIConversation()" title="Clear conversation">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm"
                                        onclick="SQT.showAISettings()" title="AI Settings">
                                    <i class="bi bi-gear"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body sqt-ai-body">
                        <div class="sqt-ai-messages" id="aiMessages">
                            <div class="sqt-ai-welcome">
                                <i class="bi bi-robot"></i>
                                <h4>How can I help you?</h4>
                                <p>Describe the data you need from NetSuite and I'll generate a SuiteQL query for you.</p>
                                <div class="sqt-ai-examples">
                                    <button class="sqt-ai-example" onclick="SQT.useAIExample('Show me all active customers with their sales rep')">
                                        Show me all active customers with their sales rep
                                    </button>
                                    <button class="sqt-ai-example" onclick="SQT.useAIExample('Find invoices from last month over $1000')">
                                        Find invoices from last month over $1000
                                    </button>
                                    <button class="sqt-ai-example" onclick="SQT.useAIExample('List all employees in the Sales department')">
                                        List all employees in the Sales department
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer sqt-ai-footer">
                        <div class="sqt-ai-input-container">
                            <textarea id="aiInput" class="sqt-ai-input"
                                      placeholder="Describe the query you need..."
                                      rows="2"
                                      onkeydown="SQT.handleAIInputKeydown(event)"></textarea>
                            <div class="sqt-ai-input-actions">
                                <div class="sqt-ai-toggle">
                                    <input type="checkbox" id="aiAutoExecute">
                                    <label for="aiAutoExecute">Auto-execute query</label>
                                </div>
                                <button type="button" class="sqt-btn sqt-btn-primary"
                                        onclick="SQT.sendAIMessage()" id="aiSendBtn">
                                    <i class="bi bi-send"></i>
                                    <span>Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Settings Modal -->
        <div class="modal fade" id="aiSettingsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-gear me-2"></i>AI Settings</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="aiProvider" class="form-label">AI Provider</label>
                            <select id="aiProvider" class="form-select" onchange="SQT.updateAIModels()">
                                <option value="">Select a provider...</option>
                                <option value="anthropic">Anthropic (Claude)</option>
                                <option value="openai">OpenAI (GPT)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="aiApiKey" class="form-label">API Key</label>
                            <div class="input-group">
                                <input type="password" id="aiApiKey" class="form-control"
                                       placeholder="Enter your API key">
                                <button class="btn btn-outline-secondary" type="button"
                                        onclick="SQT.toggleApiKeyVisibility()">
                                    <i class="bi bi-eye" id="apiKeyToggleIcon"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="aiRememberKey" checked>
                                <label class="form-check-label" for="aiRememberKey">
                                    Remember my API key
                                </label>
                            </div>
                            <div class="form-text">
                                When enabled, your API key is stored in your browser's local storage.
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="aiModel" class="form-label">Model</label>
                            <select id="aiModel" class="form-select" disabled>
                                <option value="">Select a provider first...</option>
                            </select>
                        </div>
                        <div class="alert alert-info small mb-0">
                            <i class="bi bi-info-circle me-1"></i>
                            Get your API key from
                            <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a> or
                            <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="SQT.saveAISettings()">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>

    `;
}

// =============================================================================
// SECTION 10: CLIENT-SIDE JAVASCRIPT
// =============================================================================

/**
 * Generates the client-side JavaScript.
 * @param {string} scriptUrl - The script URL for AJAX calls
 * @returns {string} JavaScript in a script tag
 */
function generateClientScript(scriptUrl, remoteAccounts, currentAccountId) {
    return `
        <script>
        /**
         * SuiteQL Query Tool - Client-Side Application
         */
         
        const REMOTE_ACCOUNTS = ${JSON.stringify(remoteAccounts)};
        const CURRENT_ACCOUNT_ID = '${currentAccountId.toUpperCase()}';
    
        const SQT = (function() {
            'use strict';

            // =================================================================
            // STATE
            // =================================================================

            const state = {
                editor: null,
                results: null,
                isRunning: false,
                currentFile: null,
                history: [],
                theme: 'light',
                viewMode: 'table',  // 'table', 'datatable', or 'json'
                sidebarVisible: false,
                focusMode: false,
                resultsMaximized: false,
                autocompleteEnabled: false,
                selectedRowIndex: 0,
                executionTimes: [],
                draftSaveTimer: null,
                // AI state
                aiConversation: [],
                aiIsLoading: false,
                aiApiKey: null,  // Session-only key storage when "Remember" is unchecked
                // Error context for AI help
                lastFailedQuery: null,
                lastError: null,
                // Last executed query for AI results chat
                lastExecutedQuery: null,
                
                // =============================================================
                // Account context (injected at page load)
                //
                // - Used to resolve execution origin (Local vs Remote)
                // - Immutable for the lifetime of the page
                // - Sourced from server-side Suitelet configuration
                // =============================================================
                remoteAccounts: REMOTE_ACCOUNTS,                // List of configured remote NetSuite accounts
                currentAccountId: CURRENT_ACCOUNT_ID,           // Account ID of the current NetSuite instance
                currentAccountDescription: CURRENT_ACCOUNT_ID   // Human-readable label (defaults to ID)
            };
            
            // Normalize once
            state.currentAccountId = state.currentAccountId.toUpperCase();
            
            // Resolve description once
            const localAccount = state.remoteAccounts.find(
                acc => String(acc.account).toUpperCase() === state.currentAccountId
            );
            
            state.currentAccountDescription = localAccount?.description || 'This Account';

            const CONFIG = {
                SCRIPT_URL: '${scriptUrl}',
                MAX_HISTORY: ${CONFIG.MAX_HISTORY_ENTRIES},
                STORAGE_KEY: 'sqt_history',
                THEME_KEY: 'sqt_theme',
                SIDEBAR_KEY: 'sqt_sidebar',
                DRAFT_KEY: 'sqt_draft',
                TIMES_KEY: 'sqt_execution_times',
                AUTOCOMPLETE_KEY: 'sqt_autocomplete',
                COMPACT_TOOLBAR_KEY: 'sqt_compact_toolbar',
                TOOLBAR_VISIBILITY_KEY: 'sqt_toolbar_visibility',
                FONT_SIZE_KEY: 'sqt_editor_font_size',
                MAX_EXECUTION_TIMES: 50,
                REMOTE_LIBRARY_URL: '${CONFIG.REMOTE_LIBRARY_URL}',
                // AI keys
                AI_SETTINGS_KEY: 'sqt_ai_settings',
                AI_CONVERSATION_KEY: 'sqt_ai_conversation',
                AI_RESULTS_CHAT_ENABLED: ${CONFIG.AI_RESULTS_CHAT_ENABLED},
                // Performance
                SLOW_QUERY_THRESHOLD_MS: ${CONFIG.SLOW_QUERY_THRESHOLD_MS}
            };

            // =================================================================
            // INITIALIZATION
            // =================================================================

            function init() {
                initEditor();
                initResizer();
                initTheme();
                initSidebar();
                initAutocomplete();
                initCompactToolbar();
                initToolbarVisibility();
                initEditorFontSize();
                initDragDrop();
                initUndoHistory();
                loadHistory();
                loadExecutionTimes();
                loadDraft();
                checkUrlParams();
                setupKeyboardShortcuts();
                initNLBar();

                // Prevent CodeMirror from stealing focus from NL input
                const nlInput = document.getElementById('nlQueryInput');
                console.log('Setting up NL input focus prevention, element:', nlInput);
                if (nlInput) {
                    // Use capture phase to intercept before CodeMirror
                    nlInput.addEventListener('mousedown', (e) => {
                        console.log('NL input mousedown (capture)');
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }, true);
                    nlInput.addEventListener('click', (e) => {
                        console.log('NL input click (capture)');
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        nlInput.focus();
                    }, true);
                    // Also listen on document to refocus if something steals it
                    document.addEventListener('focusin', (e) => {
                        if (e.target !== nlInput && nlInput.matches(':hover')) {
                            console.log('Focus stolen while hovering NL input, refocusing');
                            setTimeout(() => nlInput.focus(), 0);
                        }
                    });
                } else {
                    console.error('nlQueryInput element not found!');
                }

                // Prevent CodeMirror from interfering with AI modal interactions
                const aiModal = document.getElementById('aiModal');
                console.log('Setting up AI modal focus prevention, element:', aiModal);
                if (aiModal) {
                    aiModal.addEventListener('mousedown', (e) => {
                        console.log('AI modal mousedown - stopping propagation');
                        e.stopPropagation();
                    });
                    aiModal.addEventListener('mouseup', (e) => {
                        e.stopPropagation();
                    });
                    aiModal.addEventListener('mousemove', (e) => {
                        e.stopPropagation();
                    });
                }

                // Also protect the AI input field specifically
                const aiInput = document.getElementById('aiInput');
                console.log('Setting up AI input focus prevention, element:', aiInput);
                if (aiInput) {
                    aiInput.addEventListener('mousedown', (e) => {
                        console.log('AI input mousedown (capture)');
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }, true);
                    aiInput.addEventListener('click', (e) => {
                        console.log('AI input click (capture)');
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        aiInput.focus();
                    }, true);
                }

                // Close dropdowns when clicking outside
                document.addEventListener('click', (e) => {
                    // Check if click is inside any dropdown or its toggle button
                    const dropdownConfigs = [
                        { id: 'optionsPanel', toggleSelector: '[onclick*="toggleOptions"]' },
                        { id: 'undoHistoryDropdown', toggleSelector: '[onclick*="showUndoHistory"]' },
                        { id: 'aiDropdown', toggleSelector: '[onclick*="toggleAIDropdown"]' },
                        { id: 'moreDropdown', toggleSelector: '[onclick*="toggleMoreDropdown"]' },
                        { id: 'runDropdown', toggleSelector: '[onclick*="toggleRunDropdown"]' } 
                    ];

                    dropdownConfigs.forEach(config => {
                        const dropdown = document.getElementById(config.id);
                        const btn = e.target.closest(config.toggleSelector);
                        if (dropdown && !dropdown.contains(e.target) && !btn) {
                            dropdown.classList.remove('show');
                        }
                    });
                });
            }
            
            function initEditor() {
                const textarea = document.getElementById('queryEditor');
                state.editor = CodeMirror.fromTextArea(textarea, {
                    mode: 'text/x-sql',
                    theme: state.theme === 'dark' ? 'dracula' : 'eclipse',
                    lineNumbers: true,
                    lineWrapping: true,
                    indentWithTabs: true,
                    tabSize: 4,
                    indentUnit: 4,
                    autofocus: true,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                    inputStyle: 'textarea',  // Fix for Safari Cmd+A selection issues
                    extraKeys: {
                        'Ctrl-Enter': runQuery,
                        'Cmd-Enter': runQuery,
                        'Ctrl-S': (cm) => { showSaveModal(); return false; },
                        'Cmd-S': (cm) => { showSaveModal(); return false; },
                        'Ctrl-Shift-F': formatQuery,
                        'Cmd-Shift-F': formatQuery,
                        'Ctrl-A': 'selectAll',
                        'Cmd-A': 'selectAll',
                        'Tab': (cm) => {
                            if (cm.somethingSelected()) {
                                cm.indentSelection('add');
                            } else {
                                cm.replaceSelection('\\t', 'end');
                            }
                        }
                    }
                });

                // Update cursor position in status bar
                state.editor.on('cursorActivity', () => {
                    const cursor = state.editor.getCursor();
                    document.getElementById('cursorPosition').textContent =
                        \`Ln \${cursor.line + 1}, Col \${cursor.ch + 1}\`;
                });

                // Auto-save draft on change
                state.editor.on('change', () => {
                    saveDraft();
                });

                // Safari fix: Manual double-click word selection
                // CodeMirror's built-in double-click handling may not work in Safari
                (function() {
                    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    if (!isSafari) return;

                    state.editor.getWrapperElement().addEventListener('dblclick', (e) => {
                        // Get the position where the double-click occurred
                        const pos = state.editor.coordsChar({ left: e.clientX, top: e.clientY });

                        // Find word boundaries at this position
                        const line = state.editor.getLine(pos.line);
                        if (!line) return;

                        // Find word start
                        let start = pos.ch;
                        while (start > 0 && /\\w/.test(line[start - 1])) {
                            start--;
                        }

                        // Find word end
                        let end = pos.ch;
                        while (end < line.length && /\\w/.test(line[end])) {
                            end++;
                        }

                        // Select the word
                        if (end > start) {
                            state.editor.setSelection(
                                { line: pos.line, ch: start },
                                { line: pos.line, ch: end }
                            );
                        }
                    });
                })();

                // Load sample query
                state.editor.setValue(\`SELECT
    ID,
    LastName,
    FirstName,
    Email,
    Phone
FROM
    Employee
WHERE
    IsInactive = 'F'
ORDER BY
    LastName,
    FirstName\`);
            }

            function initResizer() {
                const resizer = document.getElementById('resizer');
                const editorPanel = document.querySelector('.sqt-editor-panel');
                const resultsPanel = document.getElementById('resultsPanel');
                let startY, startEditorHeight, startResultsHeight;

                resizer.addEventListener('mousedown', (e) => {
                    startY = e.clientY;
                    startEditorHeight = editorPanel.offsetHeight;
                    startResultsHeight = resultsPanel.offsetHeight;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                    document.body.style.cursor = 'row-resize';
                    document.body.style.userSelect = 'none';
                });

                function resize(e) {
                    const delta = e.clientY - startY;
                    const newEditorHeight = startEditorHeight + delta;
                    const newResultsHeight = startResultsHeight - delta;

                    if (newEditorHeight > 100 && newResultsHeight > 100) {
                        editorPanel.style.flex = 'none';
                        editorPanel.style.height = newEditorHeight + 'px';
                        resultsPanel.style.flex = 'none';
                        resultsPanel.style.height = newResultsHeight + 'px';
                        state.editor.refresh();
                    }
                }

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                }
            }

            function initTheme() {
                const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || 'light';
                setTheme(savedTheme);
            }

            function initSidebar() {
                const savedState = localStorage.getItem(CONFIG.SIDEBAR_KEY);
                // Default to hidden (false) unless explicitly saved as 'true'
                state.sidebarVisible = savedState === 'true';
                // Always update visibility on init to apply default or saved state
                updateSidebarVisibility();
            }

            function toggleSidebar() {
                state.sidebarVisible = !state.sidebarVisible;
                localStorage.setItem(CONFIG.SIDEBAR_KEY, state.sidebarVisible);
                updateSidebarVisibility();
            }

            function updateSidebarVisibility() {
                const sidebar = document.getElementById('sidebar');
                const icon = document.getElementById('sidebarIcon');

                if (state.sidebarVisible) {
                    sidebar.classList.remove('collapsed');
                    if (icon) icon.className = 'bi bi-layout-sidebar';
                } else {
                    sidebar.classList.add('collapsed');
                    if (icon) icon.className = 'bi bi-layout-sidebar-inset';
                }

                // Refresh CodeMirror to adjust to new width
                if (state.editor) {
                    setTimeout(() => state.editor.refresh(), 200);
                }
            }

            function toggleFocusMode() {
                state.focusMode = !state.focusMode;
                const app = document.querySelector('.sqt-app');
                const icon = document.getElementById('focusModeIcon');

                if (state.focusMode) {
                    app.classList.add('sqt-focus-mode');
                    if (icon) icon.className = 'bi bi-fullscreen-exit';
                    showToast('info', 'Focus Mode', 'Press the button again or Escape to exit.');
                } else {
                    app.classList.remove('sqt-focus-mode');
                    if (icon) icon.className = 'bi bi-arrows-fullscreen';
                }

                // Refresh CodeMirror to adjust to new size
                if (state.editor) {
                    setTimeout(() => state.editor.refresh(), 200);
                }
            }

            function toggleResultsMaximized() {
                state.resultsMaximized = !state.resultsMaximized;
                const app = document.querySelector('.sqt-app');

                if (state.resultsMaximized) {
                    app.classList.add('sqt-results-maximized');
                    showToast('info', 'Results Maximized', 'Press Shift+R or Escape to restore.');
                } else {
                    app.classList.remove('sqt-results-maximized');
                    // Refresh CodeMirror when editor is visible again
                    if (state.editor) {
                        setTimeout(() => state.editor.refresh(), 100);
                    }
                }
            }

            function setupKeyboardShortcuts() {
                document.addEventListener('keydown', (e) => {
                    // Don't trigger shortcuts when typing in inputs
                    const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

                    // Select all in editor: Cmd+A (macOS)
                    if (e.metaKey && e.key === 'a' && state.editor && state.editor.hasFocus()) {
                        e.preventDefault();
                        state.editor.execCommand('selectAll');
                        return;
                    }

                    // Run query: Ctrl/Cmd + Enter
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        runQuery();
                    }
                    // Exit focus mode or results maximized: Escape
                    if (e.key === 'Escape') {
                        if (state.focusMode) {
                            e.preventDefault();
                            toggleFocusMode();
                        } else if (state.resultsMaximized) {
                            e.preventDefault();
                            toggleResultsMaximized();
                        }
                    }
                    // Toggle results maximized: Shift+R
                    if (e.shiftKey && e.key === 'R' && !isTyping && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toggleResultsMaximized();
                    }
                    // Navigate row details: Arrow keys
                    if (document.getElementById('rowDetailsModal').classList.contains('show')) {
                        if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            prevRow();
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            nextRow();
                        }
                    }
                    // Show keyboard shortcuts: ?
                    if (e.key === '?' && !isTyping && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        showShortcuts();
                    }
                });
            }

            // =================================================================
            // AUTO-SAVE DRAFT
            // =================================================================

            function loadDraft() {
                try {
                    const draft = localStorage.getItem(CONFIG.DRAFT_KEY);
                    if (draft && state.editor) {
                        // Only load draft if it differs from default sample query
                        const currentValue = state.editor.getValue();
                        if (draft !== currentValue && draft.trim()) {
                            state.editor.setValue(draft);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load draft:', e);
                }
            }

            function saveDraft() {
                // Debounce draft saving
                if (state.draftSaveTimer) {
                    clearTimeout(state.draftSaveTimer);
                }
                state.draftSaveTimer = setTimeout(() => {
                    try {
                        const query = state.editor.getValue();
                        localStorage.setItem(CONFIG.DRAFT_KEY, query);
                    } catch (e) {
                        console.error('Failed to save draft:', e);
                    }
                }, 1000); // Save after 1 second of inactivity
            }

            function clearDraft() {
                try {
                    localStorage.removeItem(CONFIG.DRAFT_KEY);
                } catch (e) {
                    console.error('Failed to clear draft:', e);
                }
            }

            // =================================================================
            // AUTOCOMPLETE
            // =================================================================

            function initAutocomplete() {
                const saved = localStorage.getItem(CONFIG.AUTOCOMPLETE_KEY);
                state.autocompleteEnabled = saved === 'true';
                const checkbox = document.getElementById('optAutocomplete');
                if (checkbox) {
                    checkbox.checked = state.autocompleteEnabled;
                }
                // Apply autocomplete settings to editor if enabled
                if (state.editor && state.autocompleteEnabled) {
                    state.editor.setOption('extraKeys', {
                        ...state.editor.getOption('extraKeys'),
                        'Ctrl-Space': 'autocomplete',
                        'Tab': (cm) => {
                            if (cm.somethingSelected()) {
                                cm.indentSelection('add');
                            } else {
                                cm.replaceSelection('\\t', 'end');
                            }
                        }
                    });
                    state.editor.setOption('hintOptions', {
                        tables: getTableHints(),
                        completeSingle: false
                    });
                }
            }

            function toggleAutocomplete() {
                const checkbox = document.getElementById('optAutocomplete');
                state.autocompleteEnabled = checkbox?.checked || false;
                localStorage.setItem(CONFIG.AUTOCOMPLETE_KEY, state.autocompleteEnabled);

                // Update editor with autocomplete settings
                if (state.editor && state.autocompleteEnabled) {
                    // Enable autocomplete on Ctrl-Space
                    state.editor.setOption('extraKeys', {
                        ...state.editor.getOption('extraKeys'),
                        'Ctrl-Space': 'autocomplete',
                        'Tab': (cm) => {
                            if (cm.somethingSelected()) {
                                cm.indentSelection('add');
                            } else {
                                cm.replaceSelection('\\t', 'end');
                            }
                        }
                    });
                    state.editor.setOption('hintOptions', {
                        tables: getTableHints(),
                        completeSingle: false
                    });
                    showToast('info', 'Autocomplete Enabled', 'Press Ctrl+Space to trigger suggestions.');
                } else if (state.editor) {
                    showToast('info', 'Autocomplete Disabled', 'Code completion is now off.');
                }
            }

            function initCompactToolbar() {
                const saved = localStorage.getItem(CONFIG.COMPACT_TOOLBAR_KEY);
                const isCompact = saved === 'true';
                const checkbox = document.getElementById('optCompactToolbar');
                if (checkbox) {
                    checkbox.checked = isCompact;
                }
                updateCompactToolbar(isCompact);
            }

            function toggleCompactToolbar() {
                const checkbox = document.getElementById('optCompactToolbar');
                const isCompact = checkbox?.checked || false;
                localStorage.setItem(CONFIG.COMPACT_TOOLBAR_KEY, isCompact);
                updateCompactToolbar(isCompact);
            }

            function updateCompactToolbar(isCompact) {
                const toolbar = document.querySelector('.sqt-toolbar');
                if (toolbar) {
                    toolbar.classList.toggle('sqt-toolbar-compact', isCompact);
                }
            }

            function initToolbarVisibility() {
                const saved = localStorage.getItem(CONFIG.TOOLBAR_VISIBILITY_KEY);
                const defaults = { format: true, ai: true, more: true, tables: true };
                const visibility = saved ? JSON.parse(saved) : defaults;

                // Set checkbox states
                const checkboxes = {
                    format: document.getElementById('optShowFormat'),
                    ai: document.getElementById('optShowAI'),
                    more: document.getElementById('optShowMore'),
                    tables: document.getElementById('optShowTables')
                };

                Object.keys(checkboxes).forEach(key => {
                    if (checkboxes[key]) {
                        checkboxes[key].checked = visibility[key] !== false;
                    }
                });

                applyToolbarVisibility(visibility);
            }

            function updateToolbarVisibility() {
                const visibility = {
                    format: document.getElementById('optShowFormat')?.checked !== false,
                    ai: document.getElementById('optShowAI')?.checked !== false,
                    more: document.getElementById('optShowMore')?.checked !== false,
                    tables: document.getElementById('optShowTables')?.checked !== false
                };

                localStorage.setItem(CONFIG.TOOLBAR_VISIBILITY_KEY, JSON.stringify(visibility));
                applyToolbarVisibility(visibility);
            }

            function applyToolbarVisibility(visibility) {
                const elements = {
                    format: document.getElementById('toolbarFormat'),
                    ai: document.getElementById('toolbarAI'),
                    more: document.getElementById('toolbarMore'),
                    tables: document.getElementById('toolbarTablesGroup'),
                    tablesDivider: document.getElementById('toolbarTablesDivider')
                };

                if (elements.format) elements.format.style.display = visibility.format ? '' : 'none';
                if (elements.ai) elements.ai.style.display = visibility.ai ? '' : 'none';
                if (elements.more) elements.more.style.display = visibility.more ? '' : 'none';
                if (elements.tables) elements.tables.style.display = visibility.tables ? '' : 'none';
                if (elements.tablesDivider) elements.tablesDivider.style.display = visibility.tables ? '' : 'none';
            }

            function initEditorFontSize() {
                const saved = localStorage.getItem(CONFIG.FONT_SIZE_KEY);
                const fontSize = saved || '12';
                const select = document.getElementById('optFontSize');
                if (select) {
                    select.value = fontSize;
                }
                applyEditorFontSize(fontSize);
            }

            function changeEditorFontSize() {
                const select = document.getElementById('optFontSize');
                const fontSize = select?.value || '12';
                localStorage.setItem(CONFIG.FONT_SIZE_KEY, fontSize);
                applyEditorFontSize(fontSize);
            }

            function applyEditorFontSize(fontSize) {
                const cm = document.querySelector('.CodeMirror');
                if (cm) {
                    cm.style.fontSize = fontSize + 'px';
                    // Refresh editor to recalculate line heights
                    if (state.editor) {
                        state.editor.refresh();
                    }
                }
            }

            function getTableHints() {
                // NetSuite tables for autocomplete - extracted from query library
                return {
                    'Transaction': ['id', 'tranid', 'trandate', 'entity', 'type', 'status', 'posting', 'voided', 'void', 'duedate', 'foreigntotal', 'foreignamountunpaid', 'foreignamountpaid', 'otherrefnum', 'employee', 'memo', 'postingperiod', 'createdby', 'currency', 'shipdate', 'actualshipdate', 'totalcostestimate', 'estgrossprofit', 'estgrossprofitpercent', 'paymentmethod', 'shipcarrier', 'shippingaddress', 'trackingnumberlist', 'approvalstatus', 'createddate'],
                    'TransactionLine': ['id', 'transaction', 'mainline', 'item', 'quantity', 'rate', 'netamount', 'foreignamount', 'createdfrom', 'linesequencenumber', 'isinventoryaffecting', 'taxline', 'location', 'memo', 'itemtype', 'subsidiary', 'department', 'uniquekey'],
                    'TransactionAccountingLine': ['transaction', 'transactionline', 'account', 'debit', 'credit', 'amount', 'posting', 'amountunpaid', 'paymentamountunused', 'accountingbook'],
                    'Item': ['id', 'itemid', 'itemtype', 'parent', 'description', 'fullname', 'isinactive', 'isonline', 'externalid', 'createddate', 'lastmodifieddate', 'purchasedescription', 'quantityonhand', 'quantityavailable', 'quantitycommitted', 'quantityonorder', 'quantitybackordered', 'reorderpoint', 'preferredstocklevel', 'cost', 'averagecost', 'lastpurchaseprice', 'leadtime', 'matrixtype', 'manufacturer'],
                    'Customer': ['id', 'entityid', 'companyname', 'altname', 'firstname', 'lastname', 'email', 'phone', 'title', 'isperson', 'isinactive', 'terms', 'salesrep', 'creditlimit', 'oncredithold', 'balancesearch', 'overduebalancesearch', 'unbilledorderssearch', 'datecreated', 'lastmodifieddate', 'searchstage', 'defaultshippingaddress'],
                    'Employee': ['id', 'firstname', 'lastname', 'email', 'title', 'isinactive', 'giveaccess', 'supervisor', 'issalesrep'],
                    'Vendor': ['id', 'companyname', 'isinactive', 'accountnumber', 'balance', 'email', 'phone', 'terms', 'contact', 'creditlimit', 'datecreated', 'lastmodifieddate', 'externalid'],
                    'Account': ['id', 'accttype', 'acctnumber', 'displaynamewithHierarchy', 'accountsearchdisplayname', 'balance', 'description', 'isinactive', 'legalname', 'parent'],
                    'AccountingPeriod': ['id', 'periodname', 'parent', 'startdate', 'enddate', 'isposting', 'isadjust', 'isinactive', 'isquarter', 'alllocked', 'arlocked', 'aplocked', 'allownonglchanges', 'lastmodifieddate', 'closed', 'closedondate'],
                    'Entity': ['id', 'type', 'altname', 'entitytitle'],
                    'EntityAddress': ['nkey', 'addressee', 'addr1', 'addr2', 'addr3', 'city', 'state', 'zip', 'country', 'attention'],
                    'EntityAddressbook': ['entity', 'addressbookaddress', 'defaultbilling', 'defaultshipping'],
                    'Bin': ['id', 'binnumber', 'location', 'memo'],
                    'ItemBinQuantity': ['bin', 'item', 'location', 'onhand', 'onhandavail', 'preferredbin'],
                    'Location': ['id', 'name', 'fullname', 'externalid', 'isinactive', 'mainaddress', 'latitude', 'longitude'],
                    'LocationMainAddress': ['nkey', 'addressee', 'addr1', 'addr2', 'addr3', 'city', 'state', 'zip', 'attention'],
                    'Role': ['id', 'name', 'isinactive'],
                    'RolePermissions': ['role', 'name', 'permlevel'],
                    'EmployeeRolesForSearch': ['entity', 'role'],
                    'LoginAudit': ['user', 'date', 'role'],
                    'SupportCase': ['id', 'casenumber', 'startdate', 'company', 'status', 'title', 'issue', 'category', 'assigned', 'origin', 'priority', 'timeelapsed', 'timeopen', 'timetoassign', 'timetoclose'],
                    'ItemPrice': ['item', 'price', 'isinactive', 'pricelevelname'],
                    'ItemVendor': ['item', 'vendor', 'preferredvendor', 'purchaseprice'],
                    'ItemMember': ['item', 'parentitem', 'quantity', 'memberunit'],
                    'AssemblyItemMember': ['parentitem', 'item', 'linenumber', 'quantity', 'memberunit', 'itemsource'],
                    'PreviousTransactionLineLink': ['previousdoc', 'previousline', 'nextdoc', 'nextline', 'nexttype', 'linktype', 'foreignamount'],
                    'NextTransactionLink': ['previousdoc', 'nextdoc', 'linktype'],
                    'Currency': ['id', 'symbol', 'name', 'exchangerate', 'displaysymbol', 'symbolplacement', 'currencyprecision', 'isbasecurrency', 'isinactive'],
                    'CurrencyRate': ['basecurrency', 'transactioncurrency', 'exchangerate', 'effectivedate', 'lastmodifieddate'],
                    'File': ['id', 'name', 'folder', 'createddate', 'lastmodifieddate', 'filetype', 'filesize', 'url'],
                    'MediaItemFolder': ['id', 'name', 'istoplevel', 'appfolder'],
                    'Script': ['scriptid', 'name', 'scripttype', 'owner', 'scriptfile'],
                    'ClientScript': ['id', 'name', 'scriptid', 'description', 'apiversion', 'scriptfile', 'owner', 'isinactive'],
                    'CustomField': ['scriptid', 'name', 'fieldtype', 'fieldvaluetype', 'owner', 'lastmodifieddate'],
                    'CustomList': ['name', 'description', 'scriptid', 'owner', 'isordered', 'isinactive'],
                    'CustomRecordType': ['internalid', 'name', 'scriptid', 'description', 'owner'],
                    'CustomSegment': ['name', 'recordtype', 'glimpact', 'isinactive'],
                    'DeletedRecord': ['deleteddate', 'type', 'recordid', 'deletedby', 'context'],
                    'EmployeeEmergencyContact': ['employee', 'contact', 'relationship', 'address', 'phone'],
                    'CompanyContactRelationship': ['company', 'contact', 'role'],
                    'CompanyFeatureSetup': ['id', 'name', 'isavailable', 'isactive'],
                    'Country': ['id', 'name', 'edition', 'nationality'],
                    'State': ['id', 'shortname', 'fullname', 'country'],
                    'PhoneCall': ['id', 'externalid', 'createddate', 'startdate', 'completeddate', 'owner', 'assigned', 'company', 'contact', 'transaction', 'relateditem', 'supportcase', 'priority', 'status', 'phone', 'title', 'message'],
                    'Pricing': ['pricelevel', 'item', 'priceqty', 'unitprice'],
                    'PriceLevel': ['id', 'name', 'isinactive'],
                    'InventoryNumber': ['item', 'inventorynumber', 'quantityonhand', 'expirationdate'],
                    'AggregateItemLocation': ['item', 'location', 'quantityonhand', 'quantityavailable', 'quantitycommitted', 'quantityonorder', 'quantitybackordered', 'quantityintransit', 'qtyintransitexternal', 'onhandvaluemli', 'averagecostmli', 'lastpurchasepricemli', 'preferredstocklevel', 'leadtime', 'safetystocklevel', 'leadtimeoffset', 'lastinvtcountdate', 'nextinvtcountdate', 'invtcountinterval', 'invtclassification', 'costinglotsize', 'lastquantityavailablechange'],
                    'ItemInventoryBalance': ['item', 'quantityavailable'],
                    'UpsellItem': ['customer', 'purchaseditem', 'item', 'corrrelationfld', 'countfld'],
                    'TransactionShipment': ['doc', 'sourceaddress', 'destinationaddress', 'shippingmethod', 'weight', 'shippingrate', 'handlingrate'],
                    'TrackingNumber': ['id', 'trackingnumber'],
                    'TrackingNumberMap': ['transaction', 'trackingnumber'],
                    'InboundShipment': ['id', 'shipmentstatus', 'expectedshippingdate', 'actualshippingdate', 'expecteddeliverydate', 'shipmentmemo', 'externaldocumentnumber', 'billoflading'],
                    'InboundShipmentItem': ['inboundshipment', 'receivinglocation', 'shipmentitemdescription', 'quantityexpected', 'unit', 'expectedrate', 'purchaseordertransaction', 'shipmentitemtransaction'],
                    'OutboundRequest': ['time', 'key', 'requestid', 'elapsed', 'host', 'port', 'url', 'statuscode', 'error', 'requestcontenttype', 'requestcontentlength', 'responsecontenttype', 'responsecontentlength', 'scriptdeploymenturl', 'scriptid'],
                    'PaymentMethod': ['id', 'name', 'methodtype', 'merchantaccounts', 'isinactive'],
                    'Term': ['id', 'name', 'isinactive'],
                    'AccountSubsidiaryMap': ['account', 'subsidiary'],
                    'Contact': ['id', 'entityid', 'firstname', 'lastname', 'email', 'phone', 'company', 'isinactive'],
                    'Department': ['id', 'name', 'fullname', 'parent', 'isinactive'],
                    'Subsidiary': ['id', 'name', 'fullname', 'parent', 'isinactive', 'country', 'currency'],
                    'Dual': []
                };
            }

            // =================================================================
            // EXECUTION TIME TRACKING
            // =================================================================

            function loadExecutionTimes() {
                try {
                    const saved = localStorage.getItem(CONFIG.TIMES_KEY);
                    if (saved) {
                        state.executionTimes = JSON.parse(saved);
                    }
                } catch (e) {
                    console.error('Failed to load execution times:', e);
                }
            }

            function saveExecutionTime(query, elapsedTime, rowCount) {
                const entry = {
                    query: query.substring(0, 100),
                    elapsedTime,
                    rowCount,
                    timestamp: new Date().toISOString()
                };

                state.executionTimes.unshift(entry);

                // Limit stored entries
                if (state.executionTimes.length > CONFIG.MAX_EXECUTION_TIMES) {
                    state.executionTimes = state.executionTimes.slice(0, CONFIG.MAX_EXECUTION_TIMES);
                }

                try {
                    localStorage.setItem(CONFIG.TIMES_KEY, JSON.stringify(state.executionTimes));
                } catch (e) {
                    console.error('Failed to save execution times:', e);
                }
            }

            // =================================================================
            // QUERY SHARING
            // =================================================================

            function checkUrlParams() {
                const params = new URLSearchParams(window.location.search);
                const sharedQuery = params.get('query');
                if (sharedQuery && state.editor) {
                    try {
                        const query = decodeURIComponent(sharedQuery);
                        state.editor.setValue(query);
                        showToast('info', 'Query Loaded', 'Shared query has been loaded.');
                    } catch (e) {
                        console.error('Failed to load shared query:', e);
                    }
                }
            }

            function showShareModal() {
                const query = state.editor.getValue();
                if (!query.trim()) {
                    showToast('warning', 'No Query', 'Please enter a query to share.');
                    return;
                }

                const encodedQuery = encodeURIComponent(query);
                // Build full URL using current page location
                const baseUrl = window.location.origin + window.location.pathname + window.location.search;
                const separator = baseUrl.includes('?') ? '&' : '?';
                const url = baseUrl + separator + 'query=' + encodedQuery;

                document.getElementById('shareUrl').textContent = url;
                new bootstrap.Modal(document.getElementById('shareModal')).show();
            }

            function copyShareUrl() {
                const url = document.getElementById('shareUrl').textContent;
                navigator.clipboard.writeText(url).then(() => {
                    bootstrap.Modal.getInstance(document.getElementById('shareModal')).hide();
                    showToast('success', 'URL Copied', 'Share URL copied to clipboard.');
                }).catch(err => {
                    showToast('error', 'Copy Failed', 'Failed to copy URL to clipboard.');
                });
            }

            // =================================================================
            // ROW DETAILS
            // =================================================================

            function showRowDetails(index) {
                if (!state.results || !state.results.records || !state.results.records[index]) {
                    return;
                }

                state.selectedRowIndex = index;
                renderRowDetails();
                new bootstrap.Modal(document.getElementById('rowDetailsModal')).show();
            }

            function renderRowDetails() {
                const record = state.results.records[state.selectedRowIndex];
                if (!record) return;

                const columns = Object.keys(record).filter(c => c !== 'rownumber');
                const nullDisplay = document.getElementById('optNullDisplay')?.value || 'dimmed';

                let html = '<table class="table table-sm">';
                columns.forEach(col => {
                    const value = record[col];
                    let displayValue;
                    if (value === null || value === undefined) {
                        displayValue = nullDisplay === 'blank' ? '' : '<span class="sqt-null-value">null</span>';
                    } else {
                        displayValue = escapeHtml(String(value));
                    }
                    html += \`
                        <tr>
                            <th style="width: 30%; font-weight: 600;">\${escapeHtml(col)}</th>
                            <td style="word-break: break-all;">\${displayValue}</td>
                        </tr>
                    \`;
                });
                html += '</table>';

                document.getElementById('rowDetailsContent').innerHTML = html;
                document.getElementById('rowDetailsIndex').textContent =
                    \`Row \${state.selectedRowIndex + 1} of \${state.results.records.length}\`;
            }

            function prevRow() {
                if (state.selectedRowIndex > 0) {
                    state.selectedRowIndex--;
                    renderRowDetails();
                }
            }

            function nextRow() {
                if (state.results && state.selectedRowIndex < state.results.records.length - 1) {
                    state.selectedRowIndex++;
                    renderRowDetails();
                }
            }

            // =================================================================
            // COLUMN STATISTICS
            // =================================================================

            function calculateColumnStats(records) {
                if (!records || records.length === 0) return null;

                const columns = Object.keys(records[0]).filter(c => c !== 'rownumber');
                const stats = {};

                columns.forEach(col => {
                    const values = records.map(r => r[col]).filter(v => v !== null && v !== undefined);
                    const numericValues = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(v => parseFloat(v));

                    stats[col] = {
                        count: values.length,
                        nullCount: records.length - values.length,
                        isNumeric: numericValues.length > 0 && numericValues.length === values.length
                    };

                    if (stats[col].isNumeric && numericValues.length > 0) {
                        stats[col].sum = numericValues.reduce((a, b) => a + b, 0);
                        stats[col].min = Math.min(...numericValues);
                        stats[col].max = Math.max(...numericValues);
                        stats[col].avg = stats[col].sum / numericValues.length;
                    }
                });

                return stats;
            }

            function formatStatValue(value, decimals = 2) {
                if (value === undefined || value === null) return '-';
                if (Math.abs(value) >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                } else if (Math.abs(value) >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                } else if (Number.isInteger(value)) {
                    return value.toLocaleString();
                } else {
                    return value.toFixed(decimals);
                }
            }

            // =================================================================
            // FILE IMPORT (DRAG & DROP)
            // =================================================================

            function initDragDrop() {
                const editorPanel = document.querySelector('.sqt-editor-panel');
                const overlay = document.getElementById('dropOverlay');

                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    editorPanel.addEventListener(eventName, preventDefaults);
                    document.body.addEventListener(eventName, preventDefaults);
                });

                function preventDefaults(e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                ['dragenter', 'dragover'].forEach(eventName => {
                    editorPanel.addEventListener(eventName, () => {
                        overlay.classList.add('active');
                    });
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    editorPanel.addEventListener(eventName, () => {
                        overlay.classList.remove('active');
                    });
                });

                editorPanel.addEventListener('drop', handleDrop);
            }

            function handleDrop(e) {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    readSqlFile(files[0]);
                }
            }

            function importSqlFile() {
                document.getElementById('sqlFileInput').click();
            }

            function handleFileSelect(e) {
                const file = e.target.files[0];
                if (file) {
                    readSqlFile(file);
                }
                // Reset input so same file can be selected again
                e.target.value = '';
            }

            function readSqlFile(file) {
                const validExtensions = ['.sql', '.txt'];
                const extension = '.' + file.name.split('.').pop().toLowerCase();

                if (!validExtensions.includes(extension)) {
                    showToast('warning', 'Invalid File', 'Please select a .sql or .txt file.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    state.editor.setValue(content);
                    showToast('success', 'File Imported', \`Loaded: \${file.name}\`);
                };
                reader.onerror = () => {
                    showToast('error', 'Read Error', 'Failed to read the file.');
                };
                reader.readAsText(file);
            }

            function downloadQuery() {
                const query = state.editor.getValue();
                if (!query.trim()) {
                    showToast('warning', 'No Query', 'Please enter a query to download.');
                    return;
                }

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().slice(0, 10);
                const filename = \`query-\${timestamp}.sql\`;

                // Create and download the file
                const blob = new Blob([query], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showToast('success', 'Query Downloaded', \`Saved as \${filename}\`);
            }

            // =================================================================
            // COLUMN REORDERING
            // =================================================================

            let draggedColumn = null;
            let columnOrder = [];

            function initColumnDrag() {
                // This is called after rendering results
                const headers = document.querySelectorAll('.sqt-results-table th.sqt-draggable');

                headers.forEach(header => {
                    header.setAttribute('draggable', 'true');

                    header.addEventListener('dragstart', (e) => {
                        draggedColumn = header;
                        header.classList.add('sqt-dragging');
                        e.dataTransfer.effectAllowed = 'move';
                    });

                    header.addEventListener('dragend', () => {
                        header.classList.remove('sqt-dragging');
                        document.querySelectorAll('.sqt-drag-over').forEach(el => {
                            el.classList.remove('sqt-drag-over');
                        });
                        draggedColumn = null;
                    });

                    header.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        if (draggedColumn && draggedColumn !== header) {
                            header.classList.add('sqt-drag-over');
                        }
                    });

                    header.addEventListener('dragleave', () => {
                        header.classList.remove('sqt-drag-over');
                    });

                    header.addEventListener('drop', (e) => {
                        e.preventDefault();
                        header.classList.remove('sqt-drag-over');

                        if (draggedColumn && draggedColumn !== header) {
                            reorderColumns(draggedColumn.dataset.column, header.dataset.column);
                        }
                    });
                });
            }

            function reorderColumns(fromCol, toCol) {
                if (!state.results || !state.results.records) return;

                const columns = Object.keys(state.results.records[0]).filter(c => c !== 'rownumber');
                const fromIndex = columns.indexOf(fromCol);
                const toIndex = columns.indexOf(toCol);

                if (fromIndex === -1 || toIndex === -1) return;

                // Reorder the column array
                columns.splice(fromIndex, 1);
                columns.splice(toIndex, 0, fromCol);

                // Store new order
                columnOrder = columns;

                // Re-render with new order
                renderResults(state.results);
                showToast('info', 'Columns Reordered', \`Moved "\${fromCol}" column.\`);
            }

            function getOrderedColumns(records) {
                if (!records || records.length === 0) return [];
                const allColumns = Object.keys(records[0]).filter(c => c !== 'rownumber');

                if (columnOrder.length === 0) return allColumns;

                // Return columns in stored order, adding any new columns at the end
                const ordered = [];
                columnOrder.forEach(col => {
                    if (allColumns.includes(col)) ordered.push(col);
                });
                allColumns.forEach(col => {
                    if (!ordered.includes(col)) ordered.push(col);
                });
                return ordered;
            }

            // =================================================================
            // QUERY PARAMETERS
            // =================================================================

            // Storage for last used parameter values
            const PARAMS_STORAGE_KEY = 'sqt_params';

            function getStoredParams() {
                try {
                    const stored = localStorage.getItem(PARAMS_STORAGE_KEY);
                    return stored ? JSON.parse(stored) : {};
                } catch (e) {
                    return {};
                }
            }

            function saveParams(params) {
                try {
                    const existing = getStoredParams();
                    Object.assign(existing, params);
                    localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(existing));
                } catch (e) {
                    console.error('Failed to save params:', e);
                }
            }

            function extractParameters(query) {
                const params = [];
                let start = 0;
                while (true) {
                    const openIdx = query.indexOf('{{', start);
                    if (openIdx === -1) break;
                    const closeIdx = query.indexOf('}}', openIdx + 2);
                    if (closeIdx === -1) break;
                    const paramName = query.substring(openIdx + 2, closeIdx).trim();
                    if (paramName && !params.includes(paramName)) {
                        params.push(paramName);
                    }
                    start = closeIdx + 2;
                }
                return params;
            }

            function checkForParameters() {
                const query = getQueryToRun();
                const params = extractParameters(query);

                if (params.length > 0) {
                    showParametersModal(params);
                    return true;
                }
                return false;
            }

            function showParametersModal(params) {
                const content = document.getElementById('parametersContent');
                const storedParams = getStoredParams();

                let html = '<p class="text-muted small mb-3">Enter values for the following parameters:</p>';
                params.forEach((param, index) => {
                    const storedValue = storedParams[param] || '';
                    html += \`
                        <div class="sqt-param-input">
                            <label for="param_\${index}">\${escapeHtml(param)}</label>
                            <input type="text" id="param_\${index}" data-param="\${escapeHtml(param)}"
                                   value="\${escapeHtml(storedValue)}"
                                   placeholder="Enter value..." \${index === 0 ? 'autofocus' : ''}>
                        </div>
                    \`;
                });

                content.innerHTML = html;
                new bootstrap.Modal(document.getElementById('parametersModal')).show();
            }

            function runWithParameters() {
                const inputs = document.querySelectorAll('#parametersContent input[data-param]');
                let query = getQueryToRun();
                const paramsToSave = {};

                inputs.forEach(input => {
                    const paramName = input.dataset.param;
                    const value = input.value;
                    paramsToSave[paramName] = value;

                    // Simple string replacement - replace all occurrences
                    const placeholder = '{{' + paramName + '}}';
                    while (query.includes(placeholder)) {
                        query = query.replace(placeholder, value);
                    }
                });

                // Save parameter values for next time
                saveParams(paramsToSave);

                bootstrap.Modal.getInstance(document.getElementById('parametersModal')).hide();

                // Run query with substituted parameters
                runQueryWithText(query);
            }

            async function runQueryWithText(queryText) {
                if (!queryText.trim()) {
                    showToast('warning', 'No Query', 'Please enter a query to run.');
                    return;
                }

                // Inject cache buster if option is enabled
                const disableCache = document.getElementById('optDisableCache')?.checked || false;
                if (disableCache) {
                    queryText = injectCacheBuster(queryText);
                }

                setRunningState(true);
                const options = getQueryOptions();

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'queryExecute',
                            query: queryText,
                            rowBegin: options.rowBegin,
                            rowEnd: options.rowEnd,
                            paginationEnabled: options.paginationEnabled,
                            viewsEnabled: options.viewsEnabled,
                            returnTotals: options.returnTotals
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        showError(data.error.message || data.error);
                    } else {
                        data.cacheMissForced = disableCache;
                        state.results = data;
                        state.lastExecutedQuery = queryText;
                        columnOrder = []; // Reset column order for new results
                        renderResults(data);
                        addToHistory(queryText, data);
                        saveExecutionTime(queryText, data.elapsedTime, data.rowCount);
                        showToast('success', 'Query Complete',
                            \`Retrieved \${data.rowCount} rows in \${data.elapsedTime}ms\${disableCache ? ' (uncached)' : ''}\`);
                    }

                } catch (error) {
                    showError(error.message);
                } finally {
                    setRunningState(false);
                }
            }

            // =================================================================
            // KEYBOARD SHORTCUTS MODAL
            // =================================================================

            function showShortcuts() {
                new bootstrap.Modal(document.getElementById('shortcutsModal')).show();
            }

            // =================================================================
            // UNDO/REDO HISTORY
            // =================================================================

            let undoHistory = [];
            let undoHistoryIndex = -1;

            function initUndoHistory() {
                if (!state.editor) return;

                // Track changes for undo history visualization
                state.editor.on('change', (cm, change) => {
                    if (change.origin && change.origin !== 'setValue') {
                        trackUndoHistory();
                    }
                });
            }

            function trackUndoHistory() {
                const content = state.editor.getValue();
                const preview = content.substring(0, 50).replace(/\\n/g, ' ');

                // Add to history if different from last entry
                if (undoHistory.length === 0 || undoHistory[undoHistory.length - 1].content !== content) {
                    undoHistory.push({
                        content: content,
                        preview: preview || '(empty)',
                        timestamp: new Date()
                    });

                    // Limit history size
                    if (undoHistory.length > 50) {
                        undoHistory.shift();
                    }

                    undoHistoryIndex = undoHistory.length - 1;
                }
            }

            function showUndoHistory() {
                const dropdown = document.getElementById('undoHistoryDropdown');
                const list = document.getElementById('undoHistoryList');

                if (undoHistory.length === 0) {
                    list.innerHTML = '<div class="p-3 text-muted text-center">No edit history yet</div>';
                } else {
                    list.innerHTML = undoHistory.slice().reverse().map((entry, revIndex) => {
                        const index = undoHistory.length - 1 - revIndex;
                        const isActive = index === undoHistoryIndex;
                        const timeAgo = formatTimestamp(entry.timestamp.toISOString());
                        return \`
                            <div class="sqt-history-dropdown-item \${isActive ? 'active' : ''}"
                                 onclick="SQT.restoreFromUndoHistory(\${index})">
                                <span class="sqt-history-dropdown-item-preview">\${escapeHtml(entry.preview)}...</span>
                                <span class="sqt-history-dropdown-item-time">\${timeAgo}</span>
                            </div>
                        \`;
                    }).join('');
                }

                dropdown.classList.toggle('show');
            }

            function closeUndoHistory() {
                document.getElementById('undoHistoryDropdown').classList.remove('show');
            }

            function restoreFromUndoHistory(index) {
                if (index >= 0 && index < undoHistory.length) {
                    state.editor.setValue(undoHistory[index].content);
                    undoHistoryIndex = index;
                    closeUndoHistory();
                    showToast('info', 'Restored', 'Editor content restored from history.');
                }
            }

            // =================================================================
            // QUERY EXECUTION
            // =================================================================

            async function runQuery(remoteUrl = null) {
                let query = getQueryToRun();

                if (!query.trim()) {
                    showToast('warning', 'No Query', 'Please enter a query to run.');
                    return;
                }

                // Check for parameters - if found, show modal and return
                if (checkForParameters()) {
                    return;
                }

                // Inject cache buster if option is enabled
                const disableCache = document.getElementById('optDisableCache')?.checked || false;
                if (disableCache) {
                    query = injectCacheBuster(query);
                }

                setRunningState(true);
                columnOrder = []; // Reset column order for new results

                const options = getQueryOptions();

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'queryExecute',
                            query: query,
                            rowBegin: options.rowBegin,
                            rowEnd: options.rowEnd,
                            paginationEnabled: options.paginationEnabled,
                            viewsEnabled: options.viewsEnabled,
                            returnTotals: options.returnTotals,
                            remoteUrl: remoteUrl
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        showError(data.error.message || data.error);
                    } else {
                                       
                        // -----------------------------------------------------------------
                        // Resolve execution context (Local vs Remote)
                        //
                        // Responsibility:
                        // - Attach a clear, immutable execution context to the result payload
                        // - This context is consumed by the results renderer (renderResults)
                        // - Must be derived here, where execution identity (remoteUrl) is known
                        //
                        // Design notes:
                        // - \`remoteUrl\` is the execution *identity* for remote queries
                        // - Presentation metadata (description / account ID) is resolved from
                        //   pre-injected, immutable client-side configuration (state.remoteAccounts)
                        // - Local account context is resolved once at bootstrap and reused here
                        // - Do NOT normalize or resolve configuration in render or execution paths
                        // -----------------------------------------------------------------
                        if (remoteUrl) {
                            // Remote execution:
                            // Look up the remote account metadata using the execution URL.
                            // This ensures consistent labeling across all execution entry points
                            // (toolbar, dropdown, keyboard shortcuts, validation, history replay).
                            const remote = state.remoteAccounts.find(acc => acc.url === remoteUrl);
                    
                            data.executionContext = {
                                type: 'remote',
                                accountDescription: remote?.description || 'Unknown Remote',
                                accountId: remote?.account || 'Unknown'
                            };
                        } else {
                            
                            // Local execution:
                            // Use pre-resolved local account context from bootstrap state.
                            // This avoids repeated lookups and guarantees consistency for
                            // all local executions during the page lifetime.
                            data.executionContext = {
                                type: 'local',
                                accountDescription: state.currentAccountDescription,
                                accountId: state.currentAccountId
                            };
                        }
                    
                        data.cacheMissForced = disableCache;
                        state.results = data;
                        state.lastExecutedQuery = query;
                        renderResults(data);
                        addToHistory(query, data);
                        saveExecutionTime(query, data.elapsedTime, data.rowCount);
                        showToast('success', 'Query Complete',
                            \`Retrieved \${data.rowCount} rows in \${data.elapsedTime}ms\${disableCache ? ' (uncached)' : ''}\`);

                        // Show optimization banner for slow queries
                        hideOptimizeBanner(); // Hide any previous banner
                        if (data.elapsedTime > CONFIG.SLOW_QUERY_THRESHOLD_MS) {
                            showOptimizeBanner(data.elapsedTime);
                        }
                    }

                } catch (error) {
                    showError(error.message);
                } finally {
                    setRunningState(false);
                }
            }

            function getQueryToRun() {
                const selection = state.editor.getSelection();
                return selection || state.editor.getValue();
            }

            function getQueryOptions() {
                const paginationEnabled = document.getElementById('optPagination').checked;
                const returnAll = document.getElementById('optReturnAll')?.checked || false;

                return {
                    paginationEnabled,
                    rowBegin: returnAll ? 1 : parseInt(document.getElementById('optRowBegin').value) || 1,
                    rowEnd: returnAll ? 999999 : parseInt(document.getElementById('optRowEnd').value) || ${CONFIG.ROWS_RETURNED_DEFAULT},
                    returnTotals: document.getElementById('optShowTotals')?.checked || false,
                    viewsEnabled: document.getElementById('optEnableViews')?.checked || false
                };
            }

            function generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }

            function injectCacheBuster(query) {
                const uuid = generateUUID();
                const cacheBuster = "( '" + uuid + "' = '" + uuid + "' )";

                // Normalize whitespace for pattern matching
                const normalized = query.replace(/\\s+/g, ' ').trim();

                // Check if query has a WHERE clause
                const whereMatch = normalized.match(/\\bWHERE\\b/i);

                if (whereMatch) {
                    // Find WHERE and add AND condition after the first condition
                    // Insert before ORDER BY, GROUP BY, HAVING, UNION, or end of query
                    const insertBeforePattern = /\\s+(ORDER\\s+BY|GROUP\\s+BY|HAVING|UNION|LIMIT|OFFSET|$)/i;
                    const match = query.match(insertBeforePattern);

                    if (match) {
                        const insertPos = match.index;
                        return query.slice(0, insertPos) + '\\n\\tAND ' + cacheBuster + query.slice(insertPos);
                    } else {
                        // No terminating clause found, append at end
                        return query + '\\n\\tAND ' + cacheBuster;
                    }
                } else {
                    // No WHERE clause - insert WHERE before ORDER BY, GROUP BY, etc., or at end
                    const insertBeforePattern = /\\s+(ORDER\\s+BY|GROUP\\s+BY|HAVING|UNION|LIMIT|OFFSET)/i;
                    const match = query.match(insertBeforePattern);

                    if (match) {
                        const insertPos = match.index;
                        return query.slice(0, insertPos) + '\\nWHERE\\n\\t' + cacheBuster + query.slice(insertPos);
                    } else {
                        // No terminating clause, append at end
                        return query + '\\nWHERE\\n\\t' + cacheBuster;
                    }
                }
            }

            function setRunningState(running) {
                state.isRunning = running;
                const btn = document.getElementById('runButton');
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');

                if (running) {
                    btn.disabled = true;
                    btn.innerHTML = '<div class="sqt-spinner" style="width: 14px; height: 14px; border-width: 2px; margin: 0;"></div><span>Running...</span>';
                    dot.classList.add('running');
                    text.textContent = 'Running query...';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-play-fill"></i><span>Run</span> <i class="bi bi-chevron-down"></i>';
                    dot.classList.remove('running');
                    text.textContent = 'Ready';
                }
            }

            // =================================================================
            // RESULTS RENDERING
            // =================================================================

            function clearResults() {
                // Skip if no results to clear
                if (!state.results) {
                    return;
                }

                // Confirm before clearing
                if (!confirm('Clear the current results?')) {
                    return;
                }

                state.results = null;
                const panel = document.getElementById('resultsPanel');
                panel.innerHTML = \`
                    <div class="sqt-empty-state" id="emptyState">
                        <i class="bi bi-terminal"></i>
                        <h3>Ready to query</h3>
                        <p>Write a SuiteQL query above and click <strong>Run Query</strong> or press <span class="sqt-kbd">Ctrl</span> + <span class="sqt-kbd">Enter</span></p>
                    </div>
                \`;

                // Exit maximized mode if active
                if (state.resultsMaximized) {
                    toggleResultsMaximized();
                }

                showToast('info', 'Cleared', 'Results have been cleared.');
            }

            function renderResults(data) {
                const panel = document.getElementById('resultsPanel');

                if (!data.records || data.records.length === 0) {
                    panel.innerHTML = \`
                        <div class="sqt-empty-state">
                            <i class="bi bi-inbox"></i>
                            <h3>No results</h3>
                            <p>The query returned no records.</p>
                        </div>
                    \`;
                    return;
                }

                // Check if AI results chat is available
                const aiSettings = loadAISettings();
                const aiConfigured = aiSettings && (aiSettings.apiKey || state.aiApiKey);
                const showAIResultsBtn = CONFIG.AI_RESULTS_CHAT_ENABLED && aiConfigured;

                // Build header with view toggle
                const headerHtml = \`
                    <div class="sqt-results-header">
                        <div class="sqt-results-info">
                            <div class="sqt-results-info-item">
                                <i class="bi bi-table"></i>
                                <span>\${data.rowCount} rows</span>
                                \${data.totalRecordCount ? \`<span class="text-muted">of \${data.totalRecordCount} total</span>\` : ''}
                            </div>
                            <div class="sqt-results-info-item">
                                <i class="bi bi-clock"></i>
                                <span>\${data.elapsedTime}ms</span>
                                \${data.cacheMissForced ? '<span class="sqt-cache-miss-badge" title="Cache miss was forced for this query">uncached</span>' : ''}
                            </div>    
                            <div class="sqt-results-info-item">
                                <i class="bi bi-diagram-3"></i>
                                <span>\${data.executionContext.type === 'remote' ? 'Remote' : 'Local'}: \${escapeHtml(data.executionContext.accountDescription)} (\${escapeHtml(data.executionContext.accountId)})
                                </span>
                            </div>
                        </div>
                        <div class="sqt-results-actions">
                            <div class="sqt-view-toggle">
                                <button type="button" class="sqt-view-toggle-btn \${state.viewMode === 'table' ? 'active' : ''}" onclick="SQT.setViewMode('table')" title="Table view">
                                    <i class="bi bi-table"></i> Table
                                </button>
                                <button type="button" class="sqt-view-toggle-btn \${state.viewMode === 'datatable' ? 'active' : ''}" onclick="SQT.setViewMode('datatable')" title="DataTable view with sorting">
                                    <i class="bi bi-filter"></i> DataTable
                                </button>
                                <button type="button" class="sqt-view-toggle-btn \${state.viewMode === 'json' ? 'active' : ''}" onclick="SQT.setViewMode('json')" title="JSON view">
                                    <i class="bi bi-braces"></i> JSON
                                </button>
                            </div>
                            \${showAIResultsBtn ? \`
                                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.askAIAboutResults()" title="Ask AI about these results">
                                    <i class="bi bi-stars"></i>
                                    <span>Ask AI</span>
                                </button>
                            \` : ''}
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.showExportModal()">
                                <i class="bi bi-download"></i>
                                <span>Export</span>
                            </button>
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon" onclick="SQT.clearResults()" title="Clear results">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm sqt-btn-icon sqt-results-maximize-btn" onclick="SQT.toggleResultsMaximized()" title="Maximize results (Shift+R)">
                                <i class="bi bi-arrows-fullscreen"></i>
                            </button>
                        </div>
                    </div>
                \`;

                // Render based on view mode
                let contentHtml;
                switch (state.viewMode) {
                    case 'datatable':
                        contentHtml = renderDataTableView(data);
                        break;
                    case 'json':
                        contentHtml = renderJsonView(data);
                        break;
                    default:
                        contentHtml = renderTableView(data);
                }

                panel.innerHTML = headerHtml + contentHtml;

                // Initialize DataTable if needed
                if (state.viewMode === 'datatable') {
                    try {
                        new DataTable('#resultsDataTable', {
                            pageLength: 25,
                            lengthMenu: [10, 25, 50, 100, 250, 500],
                            scrollX: true,
                            order: []
                        });
                    } catch (e) {
                        console.error('DataTable initialization error:', e);
                    }
                }

                // Initialize column drag for table view
                if (state.viewMode === 'table') {
                    initColumnDrag();
                    initPinnedColumns();
                }
            }

            function initPinnedColumns() {
                const table = document.querySelector('.sqt-results-table');
                if (!table) return;

                const pinnedHeaders = table.querySelectorAll('th.sqt-pinned');
                if (pinnedHeaders.length === 0) return;

                // Calculate cumulative left positions
                let leftPos = 0;
                pinnedHeaders.forEach((th, index) => {
                    const width = th.offsetWidth;
                    th.style.left = leftPos + 'px';

                    // Apply same left to all cells in this column
                    const colIndex = Array.from(th.parentNode.children).indexOf(th);
                    table.querySelectorAll('tbody tr, tfoot tr').forEach(row => {
                        const cell = row.children[colIndex];
                        if (cell && cell.classList.contains('sqt-pinned')) {
                            cell.style.left = leftPos + 'px';
                        }
                    });

                    leftPos += width;
                });
            }

            function renderTableView(data) {
                const filteredColumns = getOrderedColumns(data.records);
                const hideRowNumbers = document.getElementById('optHideRowNumbers')?.checked;
                const nullDisplay = document.getElementById('optNullDisplay')?.value || 'dimmed';
                const showStats = document.getElementById('optShowStats')?.checked;
                const pinColumns = parseInt(document.getElementById('optPinColumns')?.value) || 0;

                // Calculate column statistics
                const stats = showStats ? calculateColumnStats(data.records) : null;

                // Helper to get pinned class for a column index
                const getPinnedClass = (colIndex, isLast = false) => {
                    if (pinColumns === 0) return '';
                    // If row numbers are visible, they take index 0
                    const effectiveIndex = hideRowNumbers ? colIndex : colIndex + 1;
                    if (effectiveIndex < pinColumns) {
                        const lastClass = isLast ? ' sqt-pinned-last' : '';
                        return ' sqt-pinned' + lastClass;
                    }
                    return '';
                };

                // Determine which column index is the last pinned one
                const lastPinnedIndex = hideRowNumbers ? pinColumns - 1 : pinColumns - 2;

                // Row number pinned class
                const rowNumPinnedClass = (!hideRowNumbers && pinColumns > 0)
                    ? ' sqt-pinned' + (pinColumns === 1 ? ' sqt-pinned-last' : '')
                    : '';

                let html = \`
                    <div class="sqt-results-container">
                        <table class="sqt-results-table">
                            <thead>
                                <tr>
                                    \${!hideRowNumbers ? '<th class="row-number' + rowNumPinnedClass + '">#</th>' : ''}
                                    \${filteredColumns.map((c, i) => \`<th class="sqt-draggable\${getPinnedClass(i, i === lastPinnedIndex)}" data-column="\${escapeHtml(c)}">\${escapeHtml(c)}</th>\`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                \`;

                data.records.forEach((record, index) => {
                    html += \`<tr class="sqt-row-clickable" onclick="SQT.showRowDetails(\${index})" title="Click to view all fields">\`;
                    if (!hideRowNumbers) {
                        html += \`<td class="row-number\${rowNumPinnedClass}">\${index + 1}</td>\`;
                    }
                    filteredColumns.forEach((col, colIndex) => {
                        const value = record[col];
                        html += \`<td class="\${getPinnedClass(colIndex, colIndex === lastPinnedIndex).trim()}">\${formatCellValue(value, nullDisplay)}</td>\`;
                    });
                    html += '</tr>';
                });

                html += '</tbody>';

                // Add statistics footer if enabled
                if (stats) {
                    html += '<tfoot>';

                    // Sum row
                    html += '<tr class="sqt-stats-row">';
                    if (!hideRowNumbers) html += '<td class="row-number' + rowNumPinnedClass + '">SUM</td>';
                    filteredColumns.forEach((col, colIndex) => {
                        const colStats = stats[col];
                        html += \`<td class="\${getPinnedClass(colIndex, colIndex === lastPinnedIndex).trim()}">\${colStats.isNumeric ? formatStatValue(colStats.sum) : '-'}</td>\`;
                    });
                    html += '</tr>';

                    // Avg row
                    html += '<tr class="sqt-stats-row">';
                    if (!hideRowNumbers) html += '<td class="row-number' + rowNumPinnedClass + '">AVG</td>';
                    filteredColumns.forEach((col, colIndex) => {
                        const colStats = stats[col];
                        html += \`<td class="\${getPinnedClass(colIndex, colIndex === lastPinnedIndex).trim()}">\${colStats.isNumeric ? formatStatValue(colStats.avg) : '-'}</td>\`;
                    });
                    html += '</tr>';

                    // Min row
                    html += '<tr class="sqt-stats-row">';
                    if (!hideRowNumbers) html += '<td class="row-number' + rowNumPinnedClass + '">MIN</td>';
                    filteredColumns.forEach((col, colIndex) => {
                        const colStats = stats[col];
                        html += \`<td class="\${getPinnedClass(colIndex, colIndex === lastPinnedIndex).trim()}">\${colStats.isNumeric ? formatStatValue(colStats.min) : '-'}</td>\`;
                    });
                    html += '</tr>';

                    // Max row
                    html += '<tr class="sqt-stats-row">';
                    if (!hideRowNumbers) html += '<td class="row-number' + rowNumPinnedClass + '">MAX</td>';
                    filteredColumns.forEach((col, colIndex) => {
                        const colStats = stats[col];
                        html += \`<td class="\${getPinnedClass(colIndex, colIndex === lastPinnedIndex).trim()}">\${colStats.isNumeric ? formatStatValue(colStats.max) : '-'}</td>\`;
                    });
                    html += '</tr>';

                    html += '</tfoot>';
                }

                html += \`
                        </table>
                    </div>
                \`;

                return html;
            }

            function renderDataTableView(data) {
                const columns = Object.keys(data.records[0]).filter(c => c !== 'rownumber');
                const nullDisplay = document.getElementById('optNullDisplay')?.value || 'dimmed';

                let html = \`
                    <div class="sqt-results-container" style="padding: 16px;">
                        <table id="resultsDataTable" class="table table-striped table-bordered" style="width: 100%;">
                            <thead>
                                <tr>
                                    \${columns.map(c => \`<th>\${escapeHtml(c)}</th>\`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                \`;

                data.records.forEach(record => {
                    html += '<tr>';
                    columns.forEach(col => {
                        const value = record[col];
                        html += \`<td>\${formatCellValue(value, nullDisplay)}</td>\`;
                    });
                    html += '</tr>';
                });

                html += \`
                            </tbody>
                        </table>
                    </div>
                \`;

                return html;
            }

            function renderJsonView(data) {
                const jsonString = JSON.stringify(data.records, null, 2);
                return \`
                    <div class="sqt-json-container">
                        <pre class="sqt-json-pre">\${escapeHtml(jsonString)}</pre>
                    </div>
                \`;
            }

            function setViewMode(mode) {
                state.viewMode = mode;
                if (state.results) {
                    renderResults(state.results);
                }
            }

            function refreshResults() {
                if (state.results) {
                    renderResults(state.results);
                }
            }

            function formatCellValue(value, nullDisplay) {
                if (value === null || value === undefined) {
                    switch (nullDisplay) {
                        case 'blank': return '';
                        case 'null': return '<span class="sqt-null-value">null</span>';
                        default: return '<span class="sqt-null-value">null</span>';
                    }
                }
                return escapeHtml(String(value));
            }

            function showError(message, query) {
                // Store error context for AI help
                state.lastError = message;
                state.lastFailedQuery = query || getQueryToRun();

                // Check if AI is configured
                const aiSettings = loadAISettings();
                const aiConfigured = aiSettings && (aiSettings.apiKey || state.aiApiKey);

                const panel = document.getElementById('resultsPanel');
                panel.innerHTML = \`
                    <div style="overflow: auto; height: 100%; display: flex; align-items: flex-start; justify-content: center;">
                        <div class="sqt-empty-state" style="color: var(--sqt-danger); justify-content: flex-start; min-height: auto; margin: auto 0;">
                            <i class="bi bi-exclamation-triangle"></i>
                            <h3>Query Error</h3>
                            <p style="font-family: var(--sqt-editor-font); white-space: pre-wrap; text-align: left; max-width: 600px;">\${escapeHtml(message)}</p>
                            \${aiConfigured ? \`
                                <button type="button" class="sqt-btn sqt-btn-secondary" onclick="SQT.askAIForHelp()" style="margin-top: 16px;">
                                    <i class="bi bi-stars"></i> Ask AI for Help
                                </button>
                            \` : ''}
                        </div>
                    </div>
                \`;
                showToast('error', 'Query Failed', 'See error details in the results panel.');
            }

            // =================================================================
            // QUERY HISTORY
            // =================================================================

            function loadHistory() {
                try {
                    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
                    if (saved) {
                        state.history = JSON.parse(saved);
                        renderHistory();
                    }
                } catch (e) {
                    console.error('Failed to load history:', e);
                }
            }

            function addToHistory(query, result) {
                const entry = {
                    id: Date.now(),
                    query: query.trim(),
                    timestamp: new Date().toISOString(),
                    rowCount: result.rowCount,
                    elapsedTime: result.elapsedTime
                };

                // Remove duplicate if exists
                state.history = state.history.filter(h => h.query !== entry.query);

                // Add to beginning
                state.history.unshift(entry);

                // Limit size
                if (state.history.length > CONFIG.MAX_HISTORY) {
                    state.history = state.history.slice(0, CONFIG.MAX_HISTORY);
                }

                saveHistory();
                renderHistory();
            }

            function saveHistory() {
                try {
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.history));
                } catch (e) {
                    console.error('Failed to save history:', e);
                }
            }

            function renderHistory() {
                const list = document.getElementById('historyList');

                if (state.history.length === 0) {
                    list.innerHTML = \`
                        <div class="sqt-empty-state" style="padding: 24px;">
                            <i class="bi bi-clock-history" style="font-size: 24px;"></i>
                            <p style="margin-top: 8px;">No query history yet</p>
                        </div>
                    \`;
                    return;
                }

                list.innerHTML = state.history.map(entry => \`
                    <div class="sqt-history-item" onclick="SQT.loadFromHistory('\${entry.id}')" title="\${escapeHtml(entry.query)}">
                        <div class="sqt-history-item-query">\${escapeHtml(entry.query.substring(0, 100))}</div>
                        <div class="sqt-history-item-meta">
                            <span>\${entry.rowCount} rows</span>
                            <span>\${entry.elapsedTime}ms</span>
                            <span>\${formatTimestamp(entry.timestamp)}</span>
                        </div>
                    </div>
                \`).join('');
            }

            function loadFromHistory(id) {
                const entry = state.history.find(h => h.id === parseInt(id));
                if (entry) {
                    state.editor.setValue(entry.query);
                    showToast('info', 'Query Loaded', 'Query loaded from history.');
                }
            }

            function clearHistory() {
                if (confirm('Clear all query history?')) {
                    state.history = [];
                    saveHistory();
                    renderHistory();
                    showToast('info', 'History Cleared', 'Query history has been cleared.');
                }
            }

            // =================================================================
            // THEME
            // =================================================================

            function toggleTheme() {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
            }

            function setTheme(theme) {
                state.theme = theme;
                document.documentElement.setAttribute('data-bs-theme', theme);
                localStorage.setItem(CONFIG.THEME_KEY, theme);

                // Update CodeMirror theme
                if (state.editor) {
                    state.editor.setOption('theme', theme === 'dark' ? 'dracula' : 'eclipse');
                }

                // Update icon
                const icon = document.getElementById('themeIcon');
                if (icon) {
                    icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
                }
            }

            // =================================================================
            // OPTIONS
            // =================================================================

            function toggleOptions() {
                closeAllDropdowns();
                const panel = document.getElementById('optionsPanel');
                panel.classList.toggle('show');
            }

            function toggleAIDropdown() {
                closeAllDropdowns('aiDropdown');
                const dropdown = document.getElementById('aiDropdown');
                dropdown.classList.toggle('show');
            }
            
            // function toggleRunDropdown() {
            //     closeAllDropdowns('runDropdown');
            //     document.getElementById('runDropdown')?.classList.toggle('show');
            // }
            
            function toggleRunDropdown() {
                closeAllDropdowns('runDropdown'); // ✅ tells it NOT to close itself
                const dropdown = document.getElementById('runDropdown');
                dropdown?.classList.toggle('show');
            }
            function toggleMoreDropdown() {
                closeAllDropdowns('moreDropdown');
                const dropdown = document.getElementById('moreDropdown');
                dropdown.classList.toggle('show');
            }

            function closeAllDropdowns(except = null) {
                const dropdowns = ['aiDropdown', 'moreDropdown', 'optionsPanel', 'undoHistoryDropdown', 'runDropdown'];
                dropdowns.forEach(id => {
                    if (id !== except) {
                        const el = document.getElementById(id);
                        if (el) el.classList.remove('show');
                    }
                });
            }

            function updateOptions() {
                const pagination = document.getElementById('optPagination').checked;
                document.getElementById('rowRangeOptions').style.display = pagination ? 'flex' : 'none';
                document.getElementById('returnAllOption').style.display = pagination ? 'flex' : 'none';
                document.getElementById('showTotalsOption').style.display = pagination ? 'flex' : 'none';

                const returnAll = document.getElementById('optReturnAll')?.checked;
                if (returnAll) {
                    document.getElementById('rowRangeOptions').style.display = 'none';
                }
            }

            // =================================================================
            // EXPORT
            // =================================================================

            function showExportModal() {
                new bootstrap.Modal(document.getElementById('exportModal')).show();
            }

            function exportAs(format) {
                if (!state.results || !state.results.records) {
                    showToast('warning', 'No Data', 'Run a query first to export results.');
                    return;
                }

                let content, filename, mimeType;

                if (format === 'csv') {
                    content = convertToCSV(state.results.records);
                    filename = 'query-results.csv';
                    mimeType = 'text/csv';
                    downloadFile(content, filename, mimeType);
                } else if (format === 'json') {
                    content = JSON.stringify(state.results.records, null, 2);
                    filename = 'query-results.json';
                    mimeType = 'application/json';
                    downloadFile(content, filename, mimeType);
                } else if (format === 'xlsx') {
                    exportToExcel(state.results.records);
                    bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
                    showToast('success', 'Export Complete', 'Results exported as Excel (.xlsx).');
                    return;
                }

                bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
                showToast('success', 'Export Complete', \`Results exported as \${format.toUpperCase()}.\`);
            }

            function exportToExcel(records) {
                if (!records || records.length === 0) return;

                // Filter out rownumber column
                const columns = Object.keys(records[0]).filter(c => c !== 'rownumber');

                // Create worksheet data
                const wsData = [columns]; // Header row
                records.forEach(record => {
                    const row = columns.map(col => {
                        const value = record[col];
                        return value === null || value === undefined ? '' : value;
                    });
                    wsData.push(row);
                });

                // Create workbook and worksheet
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_array ? XLSX.utils.aoa_to_sheet(wsData) : XLSX.utils.aoa_to_sheet(wsData);

                // Auto-size columns (approximate)
                const colWidths = columns.map((col, i) => {
                    let maxLen = col.length;
                    records.forEach(record => {
                        const val = record[col];
                        if (val !== null && val !== undefined) {
                            maxLen = Math.max(maxLen, String(val).length);
                        }
                    });
                    return { wch: Math.min(maxLen + 2, 50) };
                });
                ws['!cols'] = colWidths;

                XLSX.utils.book_append_sheet(wb, ws, 'Query Results');

                // Generate and download file
                XLSX.writeFile(wb, 'query-results.xlsx');
            }

            function convertToCSV(records) {
                if (!records.length) return '';

                const columns = Object.keys(records[0]).filter(c => c !== 'rownumber');
                const header = columns.map(c => \`"\${c}"\`).join(',');

                const rows = records.map(record => {
                    return columns.map(col => {
                        const value = record[col];
                        if (value === null || value === undefined) return '""';
                        return \`"\${String(value).replace(/"/g, '""')}"\`;
                    }).join(',');
                });

                return [header, ...rows].join('\\n');
            }

            function downloadFile(content, filename, mimeType) {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            function copyToClipboard() {
                if (!state.results || !state.results.records) {
                    showToast('warning', 'No Data', 'Run a query first to copy results.');
                    return;
                }

                const csv = convertToCSV(state.results.records);
                navigator.clipboard.writeText(csv).then(() => {
                    bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
                    showToast('success', 'Copied', 'Results copied to clipboard.');
                }).catch(err => {
                    showToast('error', 'Copy Failed', 'Failed to copy to clipboard.');
                });
            }

            // =================================================================
            // QUERY FORMATTING
            // =================================================================

            function formatQuery() {
                const query = state.editor.getValue();
                if (!query.trim()) return;

                try {
                    const formatted = formatSQL(query);
                    state.editor.setValue(formatted);
                    showToast('info', 'Formatted', 'Query has been formatted.');
                } catch (e) {
                    showToast('warning', 'Format Error', 'Could not format query. Check syntax.');
                    console.error('Format error:', e);
                }
            }

            /**
             * Formats SQL query to match preferred style:
             * - Keywords uppercase
             * - Tab indentation
             * - Each SELECT column on its own line
             * - JOIN conditions in parentheses with spaces
             * - WHERE conditions in parentheses
             * - AND/OR at start of lines
             */
            function formatSQL(sql) {
                // Preserve comments at the top
                const lines = sql.split('\\n');
                const comments = [];
                let queryStart = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('--')) {
                        comments.push(lines[i].trim());
                        queryStart = i + 1;
                    } else if (lines[i].trim()) {
                        break;
                    }
                }

                // Get the query without leading comments
                let q = lines.slice(queryStart).join(' ');

                // Normalize whitespace
                q = q.replace(/\\s+/g, ' ').trim();

                // Protect string literals by replacing them with placeholders
                const strings = [];
                q = q.replace(/'([^']*(?:''[^']*)*)'/g, (match) => {
                    strings.push(match);
                    return '{{STR' + (strings.length - 1) + '}}';
                });

                // Protect parenthesized expressions (functions, subqueries)
                // We'll handle these specially

                // Uppercase keywords
                const keywords = [
                    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
                    'HAVING', 'INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
                    'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'FULL OUTER JOIN',
                    'JOIN', 'ON', 'AS', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
                    'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'BETWEEN', 'LIKE', 'NOT LIKE',
                    'IS NULL', 'IS NOT NULL', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT',
                    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
                    'ASC', 'DESC', 'NULLS FIRST', 'NULLS LAST', 'LIMIT', 'OFFSET',
                    'COALESCE', 'CAST', 'OVER', 'PARTITION BY', 'ROLLUP', 'CUBE'
                ];

                // Sort by length descending to match longer keywords first
                keywords.sort((a, b) => b.length - a.length);

                for (const kw of keywords) {
                    const regex = new RegExp('\\\\b' + kw.replace(/ /g, '\\\\s+') + '\\\\b', 'gi');
                    q = q.replace(regex, kw);
                }

                // Add newlines before major clauses
                q = q.replace(/\\s+(SELECT)\\s+/gi, '\\n$1\\n\\t');
                q = q.replace(/\\s+(FROM)\\s+/gi, '\\n$1\\n\\t');
                q = q.replace(/\\s+(WHERE)\\s+/gi, '\\n$1\\n\\t');
                q = q.replace(/\\s+(ORDER BY)\\s+/gi, '\\n$1\\n\\t');
                q = q.replace(/\\s+(GROUP BY)\\s+/gi, '\\n$1\\n\\t');
                q = q.replace(/\\s+(HAVING)\\s+/gi, '\\n$1\\n\\t');

                // Handle JOINs - put on new line with tab
                q = q.replace(/\\s+(INNER JOIN|LEFT OUTER JOIN|RIGHT OUTER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|FULL OUTER JOIN|JOIN)\\s+/gi, '\\n\\t$1 ');

                // Handle AND/OR in WHERE clause - new line with tab
                q = q.replace(/\\s+(AND|OR)\\s+(?!\\()/gi, '\\n\\t$1 ');

                // Format commas - new line with tab for SELECT lists
                q = q.replace(/,\\s*/g, ',\\n\\t');

                // Clean up ON clauses - keep on same line as JOIN
                q = q.replace(/\\s+ON\\s+/gi, ' ON\\n\\t\\t');

                // Add spaces inside parentheses for conditions
                // Match conditions like (x = y) and add spaces
                q = q.replace(/\\(([^()]+)\\)/g, (match, inner) => {
                    // Check if this looks like a condition (has =, <>, etc.)
                    if (/[=<>]|\\bIN\\b|\\bLIKE\\b|\\bBETWEEN\\b|\\bIS\\b/i.test(inner)) {
                        return '( ' + inner.trim() + ' )';
                    }
                    return match;
                });

                // Restore string literals
                for (let i = 0; i < strings.length; i++) {
                    q = q.replace('{{STR' + i + '}}', strings[i]);
                }

                // Clean up multiple newlines
                q = q.replace(/\\n\\s*\\n/g, '\\n');

                // Clean up leading whitespace on first line
                q = q.replace(/^\\s+/, '');

                // Ensure SELECT is at the start
                if (!q.startsWith('SELECT') && !q.startsWith('--')) {
                    q = q.replace(/^\\n*/, '');
                }

                // Add comments back
                if (comments.length > 0) {
                    q = comments.join('\\n') + '\\n' + q;
                }

                return q;
            }

            // =================================================================
            // TABLES REFERENCE
            // =================================================================

            function openTablesReference() {
                window.open(CONFIG.SCRIPT_URL + '&function=tablesReference', '_tablesRef');
            }

            // =================================================================
            // LIBRARY FUNCTIONS
            // =================================================================

            async function showRemoteLibrary() {
                const modal = new bootstrap.Modal(document.getElementById('remoteLibraryModal'));
                modal.show();

                const content = document.getElementById('remoteLibraryContent');
                content.innerHTML = '<div class="sqt-loading"><div class="sqt-spinner"></div><span>Loading query library...</span></div>';

                try {
                    const response = await fetch(CONFIG.REMOTE_LIBRARY_URL + 'index.json?nonce=' + Date.now());
                    const queries = await response.json();

                    content.innerHTML = \`
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${queries.map(q => \`
                                        <tr>
                                            <td>\${escapeHtml(q.name)}</td>
                                            <td>\${escapeHtml(q.description)}</td>
                                            <td>
                                                <button type="button" class="btn btn-sm btn-primary" onclick="SQT.loadRemoteQuery('\${q.fileName}')">
                                                    Load
                                                </button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    \`;
                } catch (error) {
                    content.innerHTML = \`
                        <div class="alert alert-danger">
                            Failed to load query library: \${escapeHtml(error.message)}
                        </div>
                    \`;
                }
            }

            async function loadRemoteQuery(filename) {
                try {
                    const response = await fetch(CONFIG.REMOTE_LIBRARY_URL + filename + '?nonce=' + Date.now());
                    const sql = await response.text();

                    state.editor.setValue(sql);
                    bootstrap.Modal.getInstance(document.getElementById('remoteLibraryModal')).hide();
                    showToast('success', 'Query Loaded', 'Query loaded from library.');
                } catch (error) {
                    showToast('error', 'Load Failed', 'Failed to load query.');
                }
            }

            async function showLocalLibrary() {
                const modal = new bootstrap.Modal(document.getElementById('localLibraryModal'));
                modal.show();

                const content = document.getElementById('localLibraryContent');
                content.innerHTML = '<div class="sqt-loading"><div class="sqt-spinner"></div><span>Loading queries...</span></div>';

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ function: 'localLibraryFilesGet' })
                    });
                    const data = await response.json();

                    if (data.error) {
                        content.innerHTML = \`<div class="alert alert-info">\${data.error}</div>\`;
                        return;
                    }

                    content.innerHTML = \`
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${data.records.map(f => \`
                                        <tr>
                                            <td>\${escapeHtml(f.name)}</td>
                                            <td>\${escapeHtml(f.description || '')}</td>
                                            <td>
                                                <button type="button" class="btn btn-sm btn-primary" onclick="SQT.loadLocalQuery(\${f.id})">
                                                    Load
                                                </button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    \`;
                } catch (error) {
                    content.innerHTML = \`<div class="alert alert-danger">Failed to load: \${escapeHtml(error.message)}</div>\`;
                }
            }

            async function loadLocalQuery(fileId) {
                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ function: 'sqlFileLoad', fileID: fileId })
                    });
                    const data = await response.json();

                    if (data.error) {
                        showToast('error', 'Load Failed', data.error);
                        return;
                    }

                    state.editor.setValue(data.sql);
                    state.currentFile = data.file;
                    bootstrap.Modal.getInstance(document.getElementById('localLibraryModal')).hide();
                    showToast('success', 'Query Loaded', \`Loaded: \${data.file.name}\`);
                } catch (error) {
                    showToast('error', 'Load Failed', error.message);
                }
            }

            function showSaveModal() {
                const query = state.editor.getValue();
                if (!query.trim()) {
                    showToast('warning', 'No Query', 'Please enter a query to save.');
                    return;
                }

                if (state.currentFile) {
                    document.getElementById('saveFileName').value = state.currentFile.name;
                    document.getElementById('saveDescription').value = state.currentFile.description || '';
                }

                new bootstrap.Modal(document.getElementById('saveModal')).show();
            }

            async function saveQuery() {
                const filename = document.getElementById('saveFileName').value.trim();
                const description = document.getElementById('saveDescription').value.trim();
                const query = state.editor.getValue();

                if (!filename) {
                    showToast('warning', 'Missing Name', 'Please enter a file name.');
                    return;
                }

                try {
                    // Check if file exists
                    const checkResponse = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ function: 'sqlFileExists', filename })
                    });
                    const checkData = await checkResponse.json();

                    if (checkData.exists) {
                        if (!confirm(\`A file named "\${filename}" already exists. Replace it?\`)) {
                            return;
                        }
                    }

                    // Save file
                    const saveResponse = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'sqlFileSave',
                            filename,
                            contents: query,
                            description
                        })
                    });
                    const saveData = await saveResponse.json();

                    if (saveData.error) {
                        showToast('error', 'Save Failed', saveData.error);
                        return;
                    }

                    state.currentFile = { id: saveData.fileID, name: filename, description };
                    bootstrap.Modal.getInstance(document.getElementById('saveModal')).hide();
                    showToast('success', 'Saved', \`Query saved as "\${filename}".\`);
                } catch (error) {
                    showToast('error', 'Save Failed', error.message);
                }
            }

            async function showWorkbooks() {
                const modal = new bootstrap.Modal(document.getElementById('workbooksModal'));
                modal.show();

                const content = document.getElementById('workbooksContent');
                content.innerHTML = '<div class="sqt-loading"><div class="sqt-spinner"></div><span>Loading workbooks...</span></div>';

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ function: 'workbooksGet' })
                    });
                    const data = await response.json();

                    if (data.error) {
                        content.innerHTML = \`<div class="alert alert-info">\${data.error}</div>\`;
                        return;
                    }

                    content.innerHTML = \`
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Owner</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${data.records.map(w => \`
                                        <tr>
                                            <td>\${escapeHtml(w.name)}</td>
                                            <td>\${escapeHtml(w.description || '')}</td>
                                            <td>\${escapeHtml(w.owner)}</td>
                                            <td>
                                                <button type="button" class="btn btn-sm btn-primary" onclick="SQT.loadWorkbook('\${w.scriptid}')">
                                                    Load
                                                </button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    \`;
                } catch (error) {
                    content.innerHTML = \`<div class="alert alert-danger">Failed to load: \${escapeHtml(error.message)}</div>\`;
                }
            }

            async function loadWorkbook(scriptId) {
                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ function: 'workbookLoad', scriptID: scriptId })
                    });
                    const data = await response.json();

                    if (data.error) {
                        showToast('error', 'Load Failed', data.error);
                        return;
                    }

                    state.editor.setValue(data.sql);
                    bootstrap.Modal.getInstance(document.getElementById('workbooksModal')).hide();
                    showToast('success', 'Workbook Loaded', 'Query loaded from workbook.');
                } catch (error) {
                    showToast('error', 'Load Failed', error.message);
                }
            }

            // =================================================================
            // HELP
            // =================================================================

            function showHelp() {
                new bootstrap.Modal(document.getElementById('helpModal')).show();
            }

            // =================================================================
            // TOAST NOTIFICATIONS
            // =================================================================

            function showToast(type, title, message) {
                const container = document.getElementById('toastContainer');
                const icons = {
                    success: 'bi-check-circle-fill',
                    error: 'bi-x-circle-fill',
                    warning: 'bi-exclamation-triangle-fill',
                    info: 'bi-info-circle-fill'
                };

                const toast = document.createElement('div');
                toast.className = \`sqt-toast sqt-toast-\${type}\`;
                toast.innerHTML = \`
                    <i class="sqt-toast-icon bi \${icons[type]}"></i>
                    <div class="sqt-toast-content">
                        <div class="sqt-toast-title">\${escapeHtml(title)}</div>
                        <div class="sqt-toast-message">\${escapeHtml(message)}</div>
                    </div>
                    <button type="button" class="sqt-toast-close" onclick="this.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                \`;

                container.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = 'slideIn 0.2s ease reverse';
                    setTimeout(() => toast.remove(), 200);
                }, 4000);
            }

            // =================================================================
            // UTILITIES
            // =================================================================

            function escapeHtml(text) {
                if (text === null || text === undefined) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            function formatTimestamp(isoString) {
                const date = new Date(isoString);
                const now = new Date();
                const diff = now - date;

                if (diff < 60000) return 'just now';
                if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
                if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
                if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';

                return date.toLocaleDateString();
            }

            // =================================================================
            // AI QUERY GENERATOR
            // =================================================================

            const AI_MODELS = {
                anthropic: [
                    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)' },
                    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
                    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast)' }
                ],
                openai: [
                    { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
                    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
                ]
            };

            function showAIModal() {
                loadAIConversation();
                renderAIConversation();
                new bootstrap.Modal(document.getElementById('aiModal')).show();

                // Focus input and scroll to bottom after modal is shown
                document.getElementById('aiModal').addEventListener('shown.bs.modal', () => {
                    document.getElementById('aiInput').focus();
                    // Delay scroll to ensure content is rendered - scroll the modal body
                    setTimeout(() => {
                        const scrollContainer = document.querySelector('.sqt-ai-body');
                        if (scrollContainer) {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                        }
                    }, 50);
                }, { once: true });
            }

            function loadAISettings() {
                try {
                    const saved = localStorage.getItem(CONFIG.AI_SETTINGS_KEY);
                    if (saved) {
                        const settings = JSON.parse(saved);
                        // If remember was false, don't include the apiKey from storage
                        if (!settings.rememberKey) {
                            settings.apiKey = state.aiApiKey || '';
                        }
                        return settings;
                    }
                    return null;
                } catch (e) {
                    console.error('Failed to load AI settings:', e);
                    return null;
                }
            }

            /**
             * Gets the API key from settings or session state.
             * @param {Object} settings - The loaded AI settings
             * @returns {string|null} The API key or null
             */
            function getAIApiKey(settings) {
                return settings?.apiKey || state.aiApiKey || null;
            }

            function saveAISettings() {
                const provider = document.getElementById('aiProvider').value;
                const apiKey = document.getElementById('aiApiKey').value;
                const model = document.getElementById('aiModel').value;
                const rememberKey = document.getElementById('aiRememberKey').checked;

                if (!provider || !apiKey || !model) {
                    showToast('warning', 'Missing Fields', 'Please fill in all fields.');
                    return;
                }

                // Always save provider, model, and remember preference
                const settings = {
                    provider,
                    model,
                    rememberKey
                };

                // Only save API key to localStorage if "Remember" is checked
                if (rememberKey) {
                    settings.apiKey = apiKey;
                } else {
                    // Store in session-only state
                    state.aiApiKey = apiKey;
                }

                try {
                    localStorage.setItem(CONFIG.AI_SETTINGS_KEY, JSON.stringify(settings));
                    bootstrap.Modal.getInstance(document.getElementById('aiSettingsModal')).hide();
                    showToast('success', 'Settings Saved', 'AI settings have been saved.');
                } catch (e) {
                    showToast('error', 'Save Failed', 'Failed to save settings.');
                }
            }

            function showAISettings() {
                const settings = loadAISettings();

                if (settings) {
                    document.getElementById('aiProvider').value = settings.provider || '';
                    updateAIModels();
                    document.getElementById('aiApiKey').value = settings.apiKey || state.aiApiKey || '';
                    document.getElementById('aiModel').value = settings.model || '';
                    document.getElementById('aiRememberKey').checked = settings.rememberKey !== false;
                } else {
                    document.getElementById('aiProvider').value = '';
                    document.getElementById('aiApiKey').value = '';
                    document.getElementById('aiModel').value = '';
                    document.getElementById('aiRememberKey').checked = true;
                    updateAIModels();
                }

                new bootstrap.Modal(document.getElementById('aiSettingsModal')).show();
            }

            function updateAIModels() {
                const provider = document.getElementById('aiProvider').value;
                const modelSelect = document.getElementById('aiModel');

                modelSelect.innerHTML = '';
                modelSelect.disabled = !provider;

                if (provider && AI_MODELS[provider]) {
                    AI_MODELS[provider].forEach(model => {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = model.name;
                        modelSelect.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Select a provider first...';
                    modelSelect.appendChild(option);
                }
            }

            function toggleApiKeyVisibility() {
                const input = document.getElementById('aiApiKey');
                const icon = document.getElementById('apiKeyToggleIcon');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'bi bi-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'bi bi-eye';
                }
            }

            function loadAIConversation() {
                try {
                    const saved = localStorage.getItem(CONFIG.AI_CONVERSATION_KEY);
                    state.aiConversation = saved ? JSON.parse(saved) : [];
                } catch (e) {
                    console.error('Failed to load AI conversation:', e);
                    state.aiConversation = [];
                }
            }

            function saveAIConversation() {
                try {
                    localStorage.setItem(CONFIG.AI_CONVERSATION_KEY, JSON.stringify(state.aiConversation));
                } catch (e) {
                    console.error('Failed to save AI conversation:', e);
                }
            }

            function clearAIConversation() {
                state.aiConversation = [];
                saveAIConversation();
                renderAIConversation();
                showToast('info', 'Conversation Cleared', 'AI conversation has been reset.');
            }

            function formatTimestamp(isoString) {
                if (!isoString) return '';
                const date = new Date(isoString);
                return date.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }

            function renderAIConversation() {
                const container = document.getElementById('aiMessages');

                if (state.aiConversation.length === 0) {
                    container.innerHTML = \`
                        <div class="sqt-ai-welcome">
                            <i class="bi bi-robot"></i>
                            <h4>How can I help you?</h4>
                            <p>Describe the data you need from NetSuite and I'll generate a SuiteQL query for you.</p>
                            <div class="sqt-ai-examples">
                                <button class="sqt-ai-example" onclick="SQT.useAIExample('Show me all active customers with their sales rep')">
                                    Show me all active customers with their sales rep
                                </button>
                                <button class="sqt-ai-example" onclick="SQT.useAIExample('Find invoices from last month over $1000')">
                                    Find invoices from last month over $1000
                                </button>
                                <button class="sqt-ai-example" onclick="SQT.useAIExample('List all employees in the Sales department')">
                                    List all employees in the Sales department
                                </button>
                            </div>
                        </div>
                    \`;
                    return;
                }

                container.innerHTML = state.aiConversation.map(msg => {
                    const timestamp = msg.timestamp ? \`<div class="sqt-ai-timestamp">\${formatTimestamp(msg.timestamp)}</div>\` : '';
                    if (msg.role === 'user') {
                        return \`
                            <div class="sqt-ai-message user">
                                <div class="sqt-ai-avatar"><i class="bi bi-person"></i></div>
                                <div class="sqt-ai-content">\${escapeHtml(msg.content)}\${timestamp}</div>
                            </div>
                        \`;
                    } else {
                        return \`
                            <div class="sqt-ai-message assistant">
                                <div class="sqt-ai-avatar"><i class="bi bi-robot"></i></div>
                                <div class="sqt-ai-content">\${formatAIResponse(msg.content)}\${timestamp}</div>
                            </div>
                        \`;
                    }
                }).join('');

                // Scroll to bottom after DOM update - scroll the parent modal body which has overflow-y: auto
                setTimeout(() => {
                    const scrollContainer = container.closest('.sqt-ai-body');
                    if (scrollContainer) {
                        scrollContainer.scrollTop = scrollContainer.scrollHeight;
                    }
                }, 0);
            }

            // Store generated queries for safe reference by index
            const aiGeneratedQueries = [];

            function formatAIResponse(content) {
                // Clear previous queries when formatting new response
                aiGeneratedQueries.length = 0;

                // Process content in segments - escape text but preserve code blocks
                // More flexible regex: case-insensitive 'sql', optional space, any line ending
                const sqlPattern = /\`\`\`(?:sql)?\\s*[\\r\\n]+([\\s\\S]*?)\`\`\`/gi;
                let result = '';
                let lastIndex = 0;
                let match;

                while ((match = sqlPattern.exec(content)) !== null) {
                    // Escape and add text before this code block
                    const textBefore = content.substring(lastIndex, match.index);
                    result += escapeHtml(textBefore).replace(/\\n/g, '<br>');

                    // Store the SQL and get its index
                    const sql = match[1].trim();
                    const queryIndex = aiGeneratedQueries.length;
                    aiGeneratedQueries.push(sql);

                    // Check if this is an executable SELECT query
                    const isSelectQuery = /^\\s*SELECT\\s/i.test(sql);

                    // Add the formatted code block with index reference
                    result += \`
                        <pre><code>\${escapeHtml(sql)}</code></pre>
                        <div class="sqt-ai-query-actions">
                            \${isSelectQuery ? \`
                                <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm"
                                        onclick="SQT.useAIQueryByIndex(\${queryIndex}); return false;">
                                    <i class="bi bi-plus-circle me-1"></i>Insert Query
                                </button>
                            \` : ''}
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm"
                                    onclick="SQT.copyAIQueryByIndex(\${queryIndex}); return false;">
                                <i class="bi bi-clipboard me-1"></i>Copy
                            </button>
                        </div>
                    \`;

                    lastIndex = match.index + match[0].length;
                }

                // Add any remaining text after the last code block
                const textAfter = content.substring(lastIndex);
                result += escapeHtml(textAfter).replace(/\\n/g, '<br>');

                // Convert inline code
                result = result.replace(/\`([^\`]+)\`/g, '<code>$1</code>');

                return result;
            }

            function useAIQueryByIndex(index) {
                const sql = aiGeneratedQueries[index];
                if (sql) {
                    useAIQuery(sql);
                }
            }

            function copyAIQueryByIndex(index) {
                const sql = aiGeneratedQueries[index];
                if (sql) {
                    copyAIQuery(sql);
                }
            }

            function useAIExample(text) {
                document.getElementById('aiInput').value = text;
                sendAIMessage();
            }

            function askAIForHelp() {
                if (!state.lastFailedQuery || !state.lastError) {
                    showToast('warning', 'No Error Context', 'No recent query error to get help with.');
                    return;
                }

                // Build the help request message
                const helpMessage = \`My SuiteQL query failed with the following error:

**Error:** \${state.lastError}

**Query:**
\\\`\\\`\\\`sql
\${state.lastFailedQuery}
\\\`\\\`\\\`

Can you help me fix this query?\`;

                // Open the AI modal
                loadAIConversation();
                renderAIConversation();
                const modal = new bootstrap.Modal(document.getElementById('aiModal'));
                modal.show();

                // Pre-populate and send the message after modal is shown
                document.getElementById('aiModal').addEventListener('shown.bs.modal', () => {
                    // Scroll to bottom first - scroll the modal body
                    setTimeout(() => {
                        const scrollContainer = document.querySelector('.sqt-ai-body');
                        if (scrollContainer) {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                        }
                    }, 50);
                    // Then send the help request
                    document.getElementById('aiInput').value = helpMessage;
                    sendAIMessage();
                }, { once: true });
            }

            function askAIAboutResults() {
                if (!state.results || !state.results.records || state.results.records.length === 0) {
                    showToast('warning', 'No Results', 'No query results to analyze.');
                    return;
                }

                const records = state.results.records;
                const columns = state.results.columns || Object.keys(records[0]);
                const totalRows = records.length;

                // Calculate dynamic row limit based on average row width
                // Target ~10,000 characters for results data to stay within token limits
                const TARGET_CHARS = 10000;
                const sampleSize = Math.min(10, totalRows);
                let totalSampleChars = 0;

                for (let i = 0; i < sampleSize; i++) {
                    const row = records[i];
                    totalSampleChars += columns.map(col => String(row[col] ?? '')).join(' | ').length;
                }

                const avgRowWidth = totalSampleChars / sampleSize;
                const headerWidth = columns.join(' | ').length;
                const dynamicLimit = Math.max(10, Math.floor((TARGET_CHARS - headerWidth) / avgRowWidth));

                // Use dynamic limit but cap at 100 rows
                const rowLimit = Math.min(dynamicLimit, 100);
                const rowsToSend = records.slice(0, rowLimit);
                const isTruncated = totalRows > rowLimit;

                // Format results as a table
                const header = columns.join(' | ');
                const separator = columns.map(col => '-'.repeat(Math.min(col.length, 20))).join('-|-');
                const rows = rowsToSend.map(record =>
                    columns.map(col => {
                        const val = record[col];
                        if (val === null || val === undefined) return 'NULL';
                        return String(val);
                    }).join(' | ')
                ).join('\\n');

                // Build the context message
                let contextMessage = \`I have query results I'd like to discuss.

**Query:**
\\\`\\\`\\\`sql
\${state.lastExecutedQuery || 'Query not available'}
\\\`\\\`\\\`

**Results\${isTruncated ? \` (showing \${rowLimit} of \${totalRows} rows)\` : \` (\${totalRows} rows)\`}:**
\\\`\\\`\\\`
\${header}
\${separator}
\${rows}
\\\`\\\`\\\`
\`;

                if (isTruncated) {
                    contextMessage += \`\\n*Note: Results truncated to \${rowLimit} rows. The full result set contains \${totalRows} rows.*\\n\`;
                }

                contextMessage += \`\\nWhat would you like to know about these results?\`;

                // Open the AI modal
                loadAIConversation();
                renderAIConversation();
                const modal = new bootstrap.Modal(document.getElementById('aiModal'));
                modal.show();

                // Pre-populate the input after modal is shown (don't auto-send, let user ask their question)
                document.getElementById('aiModal').addEventListener('shown.bs.modal', () => {
                    // Scroll to bottom
                    setTimeout(() => {
                        const scrollContainer = document.querySelector('.sqt-ai-body');
                        if (scrollContainer) {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                        }
                    }, 50);

                    // Add context as a user message so it's in the conversation
                    state.aiConversation.push({ role: 'user', content: contextMessage, timestamp: new Date().toISOString() });
                    saveAIConversation();
                    renderAIConversation();

                    // Focus input for user to type their question
                    document.getElementById('aiInput').focus();

                    // Show toast about truncation if applicable
                    if (isTruncated) {
                        showToast('info', 'Results Truncated', \`Showing \${rowLimit} of \${totalRows} rows to AI.\`);
                    }

                    // Auto-send to get AI acknowledgment
                    document.getElementById('aiInput').value = 'Please acknowledge that you have received the query results and are ready to answer questions about them.';
                    sendAIMessage();
                }, { once: true });
            }

            async function sendAIMessage() {
                const input = document.getElementById('aiInput');
                const message = input.value.trim();

                if (!message) return;

                const settings = loadAISettings();
                const apiKey = settings?.apiKey || state.aiApiKey;

                if (!settings || !apiKey) {
                    showToast('warning', 'Settings Required', 'Please configure AI settings first.');
                    showAISettings();
                    return;
                }

                // Add user message
                state.aiConversation.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
                saveAIConversation();
                renderAIConversation();

                // Clear input
                input.value = '';

                // Show loading state
                setAILoadingState(true);

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'aiGenerateQuery',
                            provider: settings.provider,
                            apiKey: apiKey,
                            model: settings.model,
                            messages: state.aiConversation
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        showAIError(data.error.message);
                    } else {
                        // Add assistant response
                        state.aiConversation.push({
                            role: 'assistant',
                            content: data.response,
                            timestamp: new Date().toISOString()
                        });
                        saveAIConversation();
                        renderAIConversation();

                        // Check if response contains SQL and auto-execute is enabled
                        if (document.getElementById('aiAutoExecute').checked) {
                            const sql = extractSQLFromResponse(data.response);
                            if (sql) {
                                useAIQuery(sql);
                            }
                        }
                    }

                } catch (error) {
                    showAIError('Failed to connect to AI service: ' + error.message);
                } finally {
                    setAILoadingState(false);
                }
            }

            function setAILoadingState(loading) {
                state.aiIsLoading = loading;
                const btn = document.getElementById('aiSendBtn');
                const input = document.getElementById('aiInput');

                if (loading) {
                    btn.disabled = true;
                    btn.innerHTML = '<div class="sqt-spinner" style="width: 14px; height: 14px; border-width: 2px; margin: 0;"></div>';
                    input.disabled = true;

                    // Add loading message to UI
                    const container = document.getElementById('aiMessages');
                    const loadingDiv = document.createElement('div');
                    loadingDiv.id = 'aiLoadingMessage';
                    loadingDiv.className = 'sqt-ai-loading';
                    loadingDiv.innerHTML = \`
                        <div class="sqt-spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div>
                        <span>Generating query...</span>
                    \`;
                    container.appendChild(loadingDiv);
                    container.scrollTop = container.scrollHeight;
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-send"></i><span>Send</span>';
                    input.disabled = false;
                    input.focus();

                    // Remove loading message
                    const loadingMsg = document.getElementById('aiLoadingMessage');
                    if (loadingMsg) loadingMsg.remove();
                }
            }

            function showAIError(message) {
                const container = document.getElementById('aiMessages');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'sqt-ai-error';
                errorDiv.innerHTML = \`<i class="bi bi-exclamation-triangle"></i>\${escapeHtml(message)}\`;
                container.appendChild(errorDiv);
                container.scrollTop = container.scrollHeight;
            }

            function extractSQLFromResponse(response) {
                // More flexible regex: case-insensitive 'sql', optional space, any line ending
                const match = response.match(/\`\`\`(?:sql)?\\s*[\\r\\n]+([\\s\\S]*?)\`\`\`/i);
                return match ? match[1].trim() : null;
            }

            function useAIQuery(sql) {
                // Close the AI modal
                bootstrap.Modal.getInstance(document.getElementById('aiModal')).hide();

                // Insert into editor
                state.editor.setValue(sql);

                showToast('success', 'Query Inserted', 'The generated query has been added to the editor.');

                // Auto-execute if toggle is on
                if (document.getElementById('aiAutoExecute').checked) {
                    setTimeout(() => runQuery(), 100);
                }
            }

            function copyAIQuery(sql) {
                navigator.clipboard.writeText(sql).then(() => {
                    showToast('success', 'Copied', 'Query copied to clipboard.');
                }).catch(() => {
                    showToast('error', 'Copy Failed', 'Failed to copy query.');
                });
            }

            function handleAIInputKeydown(event) {
                // Ctrl/Cmd + Enter to send
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault();
                    sendAIMessage();
                }
            }

            // =================================================================
            // AI ENHANCED FEATURES
            // =================================================================

            /**
             * Explains the current query in plain English.
             */
            async function explainQuery() {
                const query = state.editor.getValue().trim();
                if (!query) {
                    showToast('warning', 'No Query', 'Please enter a query to explain.');
                    return;
                }

                const settings = loadAISettings();
                if (!settings || !settings.provider || !settings.model) {
                    showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                    showAISettings();
                    return;
                }

                const apiKey = getAIApiKey(settings);
                if (!apiKey) {
                    showToast('warning', 'API Key Required', 'Please enter your API key in AI settings.');
                    showAISettings();
                    return;
                }

                // Show explain panel with loading state
                const panel = document.getElementById('explainPanel');
                const content = document.getElementById('explainContent');
                panel.classList.add('visible');
                content.innerHTML = \`
                    <div class="sqt-loading">
                        <div class="sqt-spinner"></div>
                        <span>Analyzing query...</span>
                    </div>
                \`;

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'aiGenerateQuery',
                            provider: settings.provider,
                            apiKey: apiKey,
                            model: settings.model,
                            messages: [{
                                role: 'user',
                                content: \`Please explain this SuiteQL query in plain English. Break it down into sections and explain:
1. What data this query retrieves
2. The tables being used and why
3. Any joins and their purpose
4. Filter conditions (WHERE clause)
5. Sorting and grouping

Query:
\\\`\\\`\\\`sql
\${query}
\\\`\\\`\\\`

Provide a clear, concise explanation suitable for someone unfamiliar with this query.\`
                            }]
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        content.innerHTML = \`<div class="sqt-ai-error"><i class="bi bi-exclamation-triangle"></i> \${escapeHtml(data.error.message)}</div>\`;
                    } else {
                        content.innerHTML = formatAIResponse(data.response);
                    }
                } catch (error) {
                    content.innerHTML = \`<div class="sqt-ai-error"><i class="bi bi-exclamation-triangle"></i> Error: \${escapeHtml(error.message)}</div>\`;
                }
            }

            /**
             * Hides the explain panel.
             */
            function hideExplain() {
                document.getElementById('explainPanel').classList.remove('visible');
            }

            /**
             * Validates the current query for potential issues.
             */
            async function validateQuery() {
                const query = state.editor.getValue().trim();
                if (!query) {
                    showToast('warning', 'No Query', 'Please enter a query to validate.');
                    return;
                }

                const settings = loadAISettings();
                if (!settings || !settings.provider || !settings.model) {
                    showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                    showAISettings();
                    return;
                }

                const apiKey = getAIApiKey(settings);
                if (!apiKey) {
                    showToast('warning', 'API Key Required', 'Please enter your API key in AI settings.');
                    showAISettings();
                    return;
                }

                // Show validation panel with loading state
                const panel = document.getElementById('validationPanel');
                const title = document.getElementById('validationTitle');
                const content = document.getElementById('validationContent');
                const actions = document.getElementById('validationActions');
                panel.classList.remove('error');
                panel.classList.add('visible');
                title.textContent = 'Validating Query...';
                content.innerHTML = \`
                    <div class="sqt-loading">
                        <div class="sqt-spinner"></div>
                        <span>Checking for potential issues...</span>
                    </div>
                \`;
                actions.innerHTML = '';

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'aiGenerateQuery',
                            provider: settings.provider,
                            apiKey: apiKey,
                            model: settings.model,
                            messages: [{
                                role: 'user',
                                content: \`Review this SuiteQL query for potential issues and best practices. Check for:

1. **Missing WHERE clause** - Query might return too many rows
2. **Cartesian joins** - Missing join conditions that create cross products
3. **SELECT *** - Should specify columns explicitly
4. **Missing table aliases** - Can cause ambiguity
5. **Performance concerns** - Large table scans, missing filters
6. **Syntax issues** - Common SuiteQL mistakes
7. **Security concerns** - Potential injection risks in dynamic queries

Query:
\\\`\\\`\\\`sql
\${query}
\\\`\\\`\\\`

Respond in this JSON format:
{
    "status": "ok" | "warning" | "error",
    "issues": ["issue 1", "issue 2"],
    "suggestions": ["suggestion 1", "suggestion 2"],
    "summary": "Brief overall assessment"
}

Only return the JSON, no other text.\`
                            }]
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        title.textContent = 'Validation Error';
                        panel.classList.add('error');
                        content.innerHTML = \`<p>\${escapeHtml(data.error.message)}</p>\`;
                        actions.innerHTML = \`
                            <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideValidation()">Close</button>
                        \`;
                    } else {
                        // Try to parse JSON response
                        let result;
                        try {
                            // Extract JSON from response (it might be wrapped in markdown)
                            const jsonMatch = data.response.match(/\\{[\\s\\S]*\\}/);
                            result = jsonMatch ? JSON.parse(jsonMatch[0]) : { status: 'ok', summary: data.response, issues: [], suggestions: [] };
                        } catch (e) {
                            result = { status: 'ok', summary: data.response, issues: [], suggestions: [] };
                        }

                        if (result.status === 'ok' && (!result.issues || result.issues.length === 0)) {
                            title.innerHTML = '<i class="bi bi-check-circle"></i> Query Looks Good';
                            panel.classList.remove('error');
                            content.innerHTML = \`<p>\${escapeHtml(result.summary || 'No issues found.')}</p>\`;
                            if (result.suggestions && result.suggestions.length > 0) {
                                content.innerHTML += \`<p><strong>Suggestions:</strong></p><ul>\${result.suggestions.map(s => \`<li>\${escapeHtml(s)}</li>\`).join('')}</ul>\`;
                            }
                            actions.innerHTML = \`
                                <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm" onclick="SQT.hideValidation(); SQT.runQuery();">
                                    <i class="bi bi-play-fill"></i> Run Query
                                </button>
                                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideValidation()">Close</button>
                            \`;
                        } else {
                            title.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Issues Found';
                            if (result.status === 'error') {
                                panel.classList.add('error');
                            }
                            let html = \`<p>\${escapeHtml(result.summary || '')}</p>\`;
                            if (result.issues && result.issues.length > 0) {
                                html += \`<p><strong>Issues:</strong></p><ul>\${result.issues.map(i => \`<li>\${escapeHtml(i)}</li>\`).join('')}</ul>\`;
                            }
                            if (result.suggestions && result.suggestions.length > 0) {
                                html += \`<p><strong>Suggestions:</strong></p><ul>\${result.suggestions.map(s => \`<li>\${escapeHtml(s)}</li>\`).join('')}</ul>\`;
                            }
                            content.innerHTML = html;
                            actions.innerHTML = \`
                                <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm" onclick="SQT.hideValidation(); SQT.runQuery();">
                                    <i class="bi bi-play-fill"></i> Run Anyway
                                </button>
                                <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideValidation()">Close</button>
                            \`;
                        }
                    }
                } catch (error) {
                    title.textContent = 'Validation Error';
                    panel.classList.add('error');
                    content.innerHTML = \`<p>Error: \${escapeHtml(error.message)}</p>\`;
                    actions.innerHTML = \`
                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="SQT.hideValidation()">Close</button>
                    \`;
                }
            }

            /**
             * Hides the validation panel.
             */
            function hideValidation() {
                document.getElementById('validationPanel').classList.remove('visible');
            }

            /**
             * Generates a query from natural language input.
             */
            async function generateFromNaturalLanguage() {
                const input = document.getElementById('nlQueryInput');
                const btn = document.getElementById('nlGenerateBtn');
                const prompt = input.value.trim();

                if (!prompt) {
                    showToast('warning', 'Empty Input', 'Please describe what you want to query.');
                    input.focus();
                    return;
                }

                const settings = loadAISettings();
                if (!settings || !settings.provider || !settings.model) {
                    showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                    showAISettings();
                    return;
                }

                const apiKey = getAIApiKey(settings);
                if (!apiKey) {
                    showToast('warning', 'API Key Required', 'Please enter your API key in AI settings.');
                    showAISettings();
                    return;
                }

                // Show loading state
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';

                try {
                    const response = await fetch(CONFIG.SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: 'aiGenerateQuery',
                            provider: settings.provider,
                            apiKey: apiKey,
                            model: settings.model,
                            messages: [{
                                role: 'user',
                                content: \`Generate a SuiteQL query for this request: "\${prompt}"

Return ONLY the SQL query in a code block, no explanation needed. The query should be ready to execute.\`
                            }]
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        showToast('error', 'Generation Failed', data.error.message);
                    } else {
                        // Extract SQL from response
                        const sql = extractSQLFromResponse(data.response);
                        if (sql) {
                            state.editor.setValue(sql);
                            input.value = '';
                            showToast('success', 'Query Generated', 'The query has been added to the editor.');
                        } else {
                            // If no code block, try using the whole response
                            state.editor.setValue(data.response.trim());
                            input.value = '';
                            showToast('success', 'Query Generated', 'The query has been added to the editor.');
                        }
                    }
                } catch (error) {
                    showToast('error', 'Generation Failed', error.message);
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-stars"></i><span>Generate</span>';
                }
            }

            /**
             * Toggles the natural language query bar visibility.
             */
            function toggleNLBar() {
                const bar = document.getElementById('nlQueryBar');
                const btn = document.getElementById('nlBarToggle');
                const isHidden = bar.classList.toggle('hidden');

                // Update button active state
                if (btn) {
                    btn.classList.toggle('active', !isHidden);
                }

                // Save preference
                localStorage.setItem('sqt_nl_bar_visible', !isHidden ? 'true' : 'false');

                // Focus the input when showing the bar
                if (!isHidden) {
                    setTimeout(() => {
                        document.getElementById('nlQueryInput').focus();
                    }, 100);
                }
            }

            /**
             * Initializes the natural language bar visibility from saved preference.
             */
            function initNLBar() {
                const visible = localStorage.getItem('sqt_nl_bar_visible') !== 'false';
                const bar = document.getElementById('nlQueryBar');
                const btn = document.getElementById('nlBarToggle');

                if (!visible) {
                    bar.classList.add('hidden');
                }
                if (btn) {
                    btn.classList.toggle('active', visible);
                }
            }

            /**
             * Shows the optimization banner for slow queries.
             * @param {number} executionTime - Time in milliseconds
             */
            function showOptimizeBanner(executionTime) {
                const banner = document.getElementById('optimizeBanner');
                const message = document.getElementById('optimizeMessage');
                const seconds = (executionTime / 1000).toFixed(1);
                message.textContent = \`Query took \${seconds}s to execute. Would you like AI to suggest optimizations?\`;
                banner.classList.add('visible');
            }

            /**
             * Hides the optimization banner.
             */
            function hideOptimizeBanner() {
                document.getElementById('optimizeBanner').classList.remove('visible');
            }

            /**
             * Asks AI to optimize the last executed query.
             */
            async function askAIToOptimize() {
                hideOptimizeBanner();

                const query = state.lastExecutedQuery || state.editor.getValue().trim();
                if (!query) {
                    showToast('warning', 'No Query', 'No query to optimize.');
                    return;
                }

                const settings = loadAISettings();
                if (!settings || !settings.provider || !settings.model) {
                    showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                    showAISettings();
                    return;
                }

                const apiKey = getAIApiKey(settings);
                if (!apiKey) {
                    showToast('warning', 'API Key Required', 'Please enter your API key in AI settings.');
                    showAISettings();
                    return;
                }

                // Open AI modal and send optimization request
                showAIModal();

                // Add the optimization request to conversation
                const optimizePrompt = \`This query is running slowly. Please analyze it and suggest optimizations:

\\\`\\\`\\\`sql
\${query}
\\\`\\\`\\\`

Please suggest:
1. Index recommendations (if applicable)
2. Better join strategies
3. Query restructuring for performance
4. Any filtering improvements
5. An optimized version of the query\`;

                // Wait for modal to be ready, then send
                setTimeout(() => {
                    document.getElementById('aiInput').value = optimizePrompt;
                    sendAIMessage();
                }, 300);
            }

            // =================================================================
            // PUBLIC API
            // =================================================================

            return {
                init,
                runQuery,
                formatQuery,
                toggleTheme,
                toggleSidebar,
                toggleFocusMode,
                toggleResultsMaximized,
                toggleOptions,
                toggleAIDropdown,
                toggleRunDropdown,
                toggleMoreDropdown,
                closeAllDropdowns,
                updateOptions,
                openTablesReference,
                showRemoteLibrary,
                loadRemoteQuery,
                showLocalLibrary,
                loadLocalQuery,
                showSaveModal,
                saveQuery,
                showWorkbooks,
                loadWorkbook,
                showExportModal,
                exportAs,
                copyToClipboard,
                showHelp,
                loadFromHistory,
                clearHistory,
                setViewMode,
                refreshResults,
                clearResults,
                // Feature functions
                toggleAutocomplete,
                toggleCompactToolbar,
                updateToolbarVisibility,
                changeEditorFontSize,
                showShareModal,
                copyShareUrl,
                showRowDetails,
                prevRow,
                nextRow,
                // Import/Export
                importSqlFile,
                handleFileSelect,
                downloadQuery,
                // Parameters
                runWithParameters,
                // Shortcuts & History
                showShortcuts,
                showUndoHistory,
                closeUndoHistory,
                restoreFromUndoHistory,
                // AI Assistant
                showAIModal,
                showAISettings,
                saveAISettings,
                updateAIModels,
                toggleApiKeyVisibility,
                sendAIMessage,
                useAIExample,
                askAIForHelp,
                askAIAboutResults,
                useAIQuery,
                copyAIQuery,
                useAIQueryByIndex,
                copyAIQueryByIndex,
                clearAIConversation,
                handleAIInputKeydown,
                // AI Enhanced Features
                explainQuery,
                hideExplain,
                validateQuery,
                hideValidation,
                generateFromNaturalLanguage,
                toggleNLBar,
                showOptimizeBanner,
                hideOptimizeBanner,
                askAIToOptimize
            };
        })();

        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', SQT.init);
        <\/script>
    `;
}

// =============================================================================
// SECTION 11: TABLES REFERENCE HTML
// =============================================================================

/**
 * Generates HTML for the Tables Reference page.
 * @param {string} scriptUrl - The script URL
 * @returns {string} Complete HTML for tables reference
 */
function generateTablesReferenceHtml(scriptUrl) {
    return `
        <!DOCTYPE html>
        <html lang="en" data-bs-theme="light">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${generateExternalResources()}
            ${generateStyles()}
            <style>
                .sqt-tables-layout {
                    display: flex;
                    height: calc(100vh - var(--sqt-header-height));
                }

                .sqt-tables-list {
                    width: 320px;
                    border-right: 1px solid var(--sqt-border);
                    overflow-y: auto;
                    background: var(--sqt-bg-primary);
                }

                .sqt-tables-detail {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    background: var(--sqt-bg-secondary);
                }

                .sqt-table-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--sqt-border);
                    cursor: pointer;
                    transition: background-color 0.15s;
                }

                .sqt-table-item:hover {
                    background: var(--sqt-bg-tertiary);
                }

                .sqt-table-item-label {
                    font-weight: 500;
                    color: var(--sqt-text-primary);
                    margin-bottom: 2px;
                }

                .sqt-table-item-id {
                    font-family: var(--sqt-editor-font);
                    font-size: 11px;
                    color: var(--sqt-text-muted);
                }

                .sqt-detail-header {
                    margin-bottom: 24px;
                }

                .sqt-detail-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--sqt-text-primary);
                    margin-bottom: 4px;
                }

                .sqt-detail-subtitle {
                    font-family: var(--sqt-editor-font);
                    color: var(--sqt-text-secondary);
                }

                .sqt-detail-section {
                    background: var(--sqt-bg-primary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 8px;
                    margin-bottom: 24px;
                    overflow: hidden;
                }

                .sqt-detail-section-header {
                    padding: 12px 16px;
                    background: var(--sqt-bg-secondary);
                    border-bottom: 1px solid var(--sqt-border);
                    font-weight: 600;
                    color: var(--sqt-text-primary);
                }

                .sqt-search-box {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--sqt-border);
                }

                .sqt-search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--sqt-border);
                    border-radius: 6px;
                    background: var(--sqt-bg-secondary);
                    color: var(--sqt-text-primary);
                    font-size: 13px;
                }

                .sqt-search-input:focus {
                    outline: none;
                    border-color: var(--sqt-primary);
                }

                /* AI Search Toggle */
                .sqt-search-mode-toggle {
                    display: flex;
                    gap: 4px;
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--sqt-border);
                }

                .sqt-search-mode-btn {
                    flex: 1;
                    padding: 6px 12px;
                    border: 1px solid var(--sqt-border);
                    background: var(--sqt-bg-secondary);
                    color: var(--sqt-text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .sqt-search-mode-btn:first-child {
                    border-radius: 6px 0 0 6px;
                }

                .sqt-search-mode-btn:last-child {
                    border-radius: 0 6px 6px 0;
                }

                .sqt-search-mode-btn.active {
                    background: var(--sqt-primary);
                    border-color: var(--sqt-primary);
                    color: white;
                }

                .sqt-search-mode-btn:hover:not(.active) {
                    background: var(--sqt-bg-tertiary);
                }

                /* AI Search Input Area */
                .sqt-ai-search-container {
                    display: none;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--sqt-border);
                }

                .sqt-ai-search-container.active {
                    display: block;
                }

                .sqt-ai-search-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--sqt-border);
                    border-radius: 6px;
                    background: var(--sqt-bg-secondary);
                    color: var(--sqt-text-primary);
                    font-size: 13px;
                    resize: none;
                    min-height: 60px;
                }

                .sqt-ai-search-input:focus {
                    outline: none;
                    border-color: var(--sqt-primary);
                }

                .sqt-ai-search-btn {
                    margin-top: 8px;
                    width: 100%;
                }

                .sqt-ai-search-results {
                    padding: 12px;
                    background: var(--sqt-bg-tertiary);
                    border-radius: 6px;
                    margin-top: 12px;
                    font-size: 13px;
                    display: none;
                }

                .sqt-ai-search-results.active {
                    display: block;
                }

                .sqt-ai-suggested-table {
                    padding: 8px 12px;
                    background: var(--sqt-bg-primary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 4px;
                    margin-top: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .sqt-ai-suggested-table:hover {
                    border-color: var(--sqt-primary);
                    background: var(--sqt-bg-secondary);
                }

                .sqt-ai-suggested-table-name {
                    font-weight: 600;
                    color: var(--sqt-primary);
                }

                .sqt-ai-suggested-table-desc {
                    font-size: 12px;
                    color: var(--sqt-text-secondary);
                    margin-top: 2px;
                }

                /* AI Section in Table Detail */
                .sqt-ai-section {
                    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05));
                    border: 1px solid rgba(37, 99, 235, 0.2);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .sqt-ai-section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: var(--sqt-text-primary);
                    margin-bottom: 12px;
                }

                .sqt-ai-section-header i {
                    color: var(--sqt-primary);
                }

                .sqt-ai-quick-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .sqt-ai-quick-btn {
                    padding: 8px 14px;
                    background: var(--sqt-bg-primary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 20px;
                    color: var(--sqt-text-primary);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sqt-ai-quick-btn:hover {
                    border-color: var(--sqt-primary);
                    background: rgba(37, 99, 235, 0.1);
                    color: var(--sqt-primary);
                }

                .sqt-ai-quick-btn i {
                    font-size: 14px;
                }

                /* Column Selection */
                .sqt-column-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--sqt-primary);
                }

                .sqt-column-select-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sqt-column-select-actions {
                    display: flex;
                    gap: 8px;
                }

                .sqt-selection-count {
                    font-size: 12px;
                    color: var(--sqt-text-secondary);
                    padding: 4px 8px;
                    background: var(--sqt-bg-tertiary);
                    border-radius: 4px;
                }

                /* AI Chat Modal */
                .sqt-ai-modal .modal-dialog {
                    max-width: 600px;
                }

                .sqt-ai-modal .modal-content {
                    background: var(--sqt-bg-primary);
                    border: 1px solid var(--sqt-border);
                }

                .sqt-ai-modal .modal-header {
                    border-bottom: 1px solid var(--sqt-border);
                    padding: 16px 20px;
                }

                .sqt-ai-modal .modal-body {
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    height: 500px;
                }

                .sqt-ai-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .sqt-ai-message {
                    margin-bottom: 16px;
                }

                .sqt-ai-message.user {
                    text-align: right;
                }

                .sqt-ai-message-content {
                    display: inline-block;
                    max-width: 85%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                    text-align: left;
                }

                .sqt-ai-message.user .sqt-ai-message-content {
                    background: var(--sqt-primary);
                    color: white;
                }

                .sqt-ai-message.assistant .sqt-ai-message-content {
                    background: var(--sqt-bg-tertiary);
                    color: var(--sqt-text-primary);
                }

                .sqt-ai-message-content pre {
                    background: var(--sqt-bg-secondary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 6px;
                    padding: 12px;
                    margin: 8px 0;
                    overflow-x: auto;
                    font-size: 12px;
                }

                .sqt-ai-message-content code {
                    background: var(--sqt-bg-tertiary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .sqt-ai-input-area {
                    padding: 16px;
                    border-top: 1px solid var(--sqt-border);
                    display: flex;
                    gap: 8px;
                }

                .sqt-ai-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1px solid var(--sqt-border);
                    border-radius: 8px;
                    background: var(--sqt-bg-secondary);
                    color: var(--sqt-text-primary);
                    font-size: 13px;
                    resize: none;
                }

                .sqt-ai-input:focus {
                    outline: none;
                    border-color: var(--sqt-primary);
                }

                .sqt-ai-send-btn {
                    padding: 10px 16px;
                    background: var(--sqt-primary);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .sqt-ai-send-btn:hover {
                    background: var(--sqt-primary-hover);
                }

                .sqt-ai-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Copy button in AI responses */
                .sqt-ai-copy-btn {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    padding: 4px 8px;
                    background: var(--sqt-bg-tertiary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .sqt-ai-message-content pre:hover .sqt-ai-copy-btn {
                    opacity: 1;
                }

                /* Toast notifications */
                .sqt-toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                .sqt-toast {
                    min-width: 280px;
                    padding: 12px 16px;
                    margin-bottom: 10px;
                    background: var(--sqt-bg-primary);
                    border: 1px solid var(--sqt-border);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .sqt-toast.success {
                    border-left: 4px solid var(--sqt-success);
                }

                .sqt-toast.error {
                    border-left: 4px solid var(--sqt-danger);
                }

                .sqt-toast.warning {
                    border-left: 4px solid var(--sqt-warning);
                }

                .sqt-toast.info {
                    border-left: 4px solid var(--sqt-primary);
                }

                /* Loading spinner */
                .sqt-ai-loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    color: var(--sqt-text-secondary);
                    font-size: 13px;
                }

                .sqt-ai-loading .spinner-border {
                    width: 16px;
                    height: 16px;
                }

                /* Settings needed notice */
                .sqt-ai-settings-notice {
                    padding: 16px;
                    background: var(--sqt-bg-tertiary);
                    border-radius: 8px;
                    text-align: center;
                    color: var(--sqt-text-secondary);
                }

                .sqt-ai-settings-notice button {
                    margin-top: 12px;
                }

                /* Modal z-index and positioning overrides for NetSuite compatibility */
                .modal {
                    z-index: 100000 !important;
                    position: fixed !important;
                }

                .modal-backdrop {
                    z-index: 99999 !important;
                    position: fixed !important;
                }

                .modal-dialog {
                    z-index: 100001 !important;
                }

                .modal.show {
                    display: block !important;
                }

                /* Ensure modals escape any overflow:hidden containers */
                .modal, .modal-backdrop {
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                }

                /* Focus Mode */
                .sqt-app.sqt-focus-mode {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 99999;
                    width: 100vw;
                    height: 100vh;
                    max-width: 100vw;
                    max-height: 100vh;
                }

                .sqt-focus-mode .sqt-tables-layout {
                    height: calc(100vh - 56px);
                }
            </style>
        </head>
        <body>
            <!-- Toast Container -->
            <div class="sqt-toast-container" id="toastContainer"></div>

            <div class="sqt-app">
                <header class="sqt-header">
                    <div class="sqt-header-title">
                        <i class="bi bi-table"></i>
                        <span>Tables Reference</span>
                    </div>
                    <div class="sqt-header-actions">
                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="showAISettings()" title="AI Settings">
                            <i class="bi bi-gear"></i>
                        </button>
                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="toggleFocusMode()" title="Toggle focus mode (hide NetSuite chrome)">
                            <i class="bi bi-arrows-fullscreen" id="focusModeIcon"></i>
                        </button>
                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-icon" onclick="toggleTheme()" title="Toggle dark mode">
                            <i class="bi bi-moon-stars" id="themeIcon"></i>
                        </button>
                    </div>
                </header>

                <div class="sqt-tables-layout">
                    <div class="sqt-tables-list">
                        <!-- Search Mode Toggle -->
                        <div class="sqt-search-mode-toggle">
                            <button type="button" class="sqt-search-mode-btn active" onclick="setSearchMode('standard')" id="searchModeStandard">
                                <i class="bi bi-search"></i> Standard
                            </button>
                            <button type="button" class="sqt-search-mode-btn" onclick="setSearchMode('ai')" id="searchModeAI">
                                <i class="bi bi-stars"></i> AI Find
                            </button>
                        </div>

                        <!-- Standard Search -->
                        <div class="sqt-search-box" id="standardSearchBox">
                            <input type="text" class="sqt-search-input" id="tableSearch" placeholder="Search tables..." oninput="filterTables()">
                        </div>

                        <!-- AI Search -->
                        <div class="sqt-ai-search-container" id="aiSearchBox">
                            <textarea class="sqt-ai-search-input" id="aiSearchInput" placeholder="Describe what data you need...&#10;&#10;Example: I need customer payment history"></textarea>
                            <button type="button" class="sqt-btn sqt-btn-primary sqt-ai-search-btn" onclick="findTablesWithAI()" id="aiSearchBtn">
                                <i class="bi bi-stars"></i> Find Tables
                            </button>
                            <div class="sqt-ai-search-results" id="aiSearchResults"></div>
                        </div>

                        <div id="tablesList">
                            <div class="sqt-loading" style="padding: 24px;">
                                <div class="sqt-spinner"></div>
                                <span>Loading tables...</span>
                            </div>
                        </div>
                    </div>

                    <div class="sqt-tables-detail" id="tableDetail">
                        <div class="sqt-empty-state">
                            <i class="bi bi-table"></i>
                            <h3>Select a Table</h3>
                            <p>Choose a table from the list to view its columns and details.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Chat Modal -->
            <div class="modal fade sqt-ai-modal" id="aiChatModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="bi bi-stars me-2"></i>AI Table Assistant</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="sqt-ai-messages" id="aiMessages"></div>
                            <div class="sqt-ai-input-area">
                                <textarea class="sqt-ai-input" id="aiChatInput" placeholder="Ask about this table..." rows="1" onkeydown="handleAIChatKeydown(event)"></textarea>
                                <button type="button" class="sqt-ai-send-btn" onclick="sendAIChatMessage()" id="aiSendBtn">
                                    <i class="bi bi-send"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Settings Modal -->
            <div class="modal fade" id="aiSettingsModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="bi bi-gear me-2"></i>AI Settings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="aiProvider" class="form-label">AI Provider</label>
                                <select id="aiProvider" class="form-select" onchange="updateAIModels()">
                                    <option value="">Select provider...</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="openai">OpenAI (GPT)</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="aiModel" class="form-label">Model</label>
                                <select id="aiModel" class="form-select">
                                    <option value="">Select provider first...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="aiApiKey" class="form-label">API Key</label>
                                <input type="password" id="aiApiKey" class="form-control" placeholder="Enter your API key">
                                <div class="form-text">
                                    Get your API key from
                                    <a href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic Console</a> or
                                    <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>.
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveAISettings()">Save Settings</button>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // ===========================================
                // STATE & CONFIGURATION
                // ===========================================
                const SCRIPT_URL = '${scriptUrl}';
                const AI_SETTINGS_KEY = 'sqt_ai_settings';

                let allTables = [];
                let theme = localStorage.getItem('sqt_theme') || 'light';
                let currentTable = null;
                let currentTableData = null;
                let selectedColumns = new Set();
                let aiConversation = [];
                let searchMode = 'standard';

                const AI_MODELS = {
                    anthropic: [
                        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)' },
                        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
                        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' }
                    ],
                    openai: [
                        { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
                        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
                        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
                    ]
                };

                // ===========================================
                // INITIALIZATION
                // ===========================================
                document.documentElement.setAttribute('data-bs-theme', theme);
                updateThemeIcon();

                // ===========================================
                // THEME FUNCTIONS
                // ===========================================
                function toggleTheme() {
                    theme = theme === 'light' ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-bs-theme', theme);
                    localStorage.setItem('sqt_theme', theme);
                    updateThemeIcon();
                }

                function updateThemeIcon() {
                    const icon = document.getElementById('themeIcon');
                    icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
                }

                // ===========================================
                // FOCUS MODE
                // ===========================================
                let focusMode = false;

                function toggleFocusMode() {
                    focusMode = !focusMode;
                    const app = document.querySelector('.sqt-app');
                    const icon = document.getElementById('focusModeIcon');

                    if (focusMode) {
                        app.classList.add('sqt-focus-mode');
                        icon.className = 'bi bi-fullscreen-exit';
                    } else {
                        app.classList.remove('sqt-focus-mode');
                        icon.className = 'bi bi-arrows-fullscreen';
                    }
                }

                // Handle Escape key to exit focus mode
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && focusMode) {
                        toggleFocusMode();
                    }
                });

                // ===========================================
                // TOAST NOTIFICATIONS
                // ===========================================
                function showToast(type, title, message) {
                    const container = document.getElementById('toastContainer');
                    const toast = document.createElement('div');
                    toast.className = \`sqt-toast \${type}\`;
                    toast.innerHTML = \`<strong>\${escapeHtml(title)}</strong><div>\${escapeHtml(message)}</div>\`;
                    container.appendChild(toast);
                    setTimeout(() => toast.remove(), 4000);
                }

                // ===========================================
                // SEARCH MODE TOGGLE
                // ===========================================
                function setSearchMode(mode) {
                    searchMode = mode;
                    document.getElementById('searchModeStandard').classList.toggle('active', mode === 'standard');
                    document.getElementById('searchModeAI').classList.toggle('active', mode === 'ai');
                    document.getElementById('standardSearchBox').style.display = mode === 'standard' ? 'block' : 'none';
                    document.getElementById('aiSearchBox').classList.toggle('active', mode === 'ai');

                    if (mode === 'ai') {
                        const settings = loadAISettings();
                        if (!settings || !settings.apiKey) {
                            showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                        }
                    }
                }

                // ===========================================
                // TABLE LOADING & DISPLAY
                // ===========================================
                async function loadTables() {
                    try {
                        const url = '/app/recordscatalog/rcendpoint.nl?action=getRecordTypes&data=' +
                            encodeURIComponent(JSON.stringify({ structureType: 'FLAT' }));

                        const response = await fetch(url);
                        const data = await response.json();

                        allTables = data.data.sort((a, b) => a.label.localeCompare(b.label));
                        renderTablesList(allTables);
                    } catch (error) {
                        document.getElementById('tablesList').innerHTML =
                            '<div class="alert alert-danger m-3">Failed to load tables.</div>';
                    }
                }

                function renderTablesList(tables) {
                    const html = tables.map(t => \`
                        <div class="sqt-table-item" onclick="loadTableDetail('\${t.id}')">
                            <div class="sqt-table-item-label">\${escapeHtml(t.label)}</div>
                            <div class="sqt-table-item-id">\${escapeHtml(t.id)}</div>
                        </div>
                    \`).join('');

                    document.getElementById('tablesList').innerHTML = html ||
                        '<div class="sqt-empty-state" style="padding: 24px;"><p>No tables found</p></div>';
                }

                function filterTables() {
                    const search = document.getElementById('tableSearch').value.toLowerCase();
                    const filtered = allTables.filter(t =>
                        t.label.toLowerCase().includes(search) ||
                        t.id.toLowerCase().includes(search)
                    );
                    renderTablesList(filtered);
                }

                async function loadTableDetail(tableId) {
                    const detail = document.getElementById('tableDetail');
                    detail.innerHTML = '<div class="sqt-loading"><div class="sqt-spinner"></div><span>Loading table details...</span></div>';

                    try {
                        const url = '/app/recordscatalog/rcendpoint.nl?action=getRecordTypeDetail&data=' +
                            encodeURIComponent(JSON.stringify({ scriptId: tableId, detailType: 'SS_ANAL' }));

                        const response = await fetch(url);
                        const data = await response.json();
                        const record = data.data;

                        currentTable = tableId;
                        currentTableData = record;
                        selectedColumns = new Set();

                        const columns = record.fields.filter(f => f.isColumn);

                        // Check if AI is configured
                        const aiConfigured = isAIConfigured();

                        let html = \`
                            <div class="sqt-detail-header">
                                <div class="sqt-detail-title">\${escapeHtml(record.label)}</div>
                                <div class="sqt-detail-subtitle">\${escapeHtml(tableId)}</div>
                            </div>
                        \`;

                        // AI Section - Ask AI about this table
                        html += \`
                            <div class="sqt-ai-section">
                                <div class="sqt-ai-section-header">
                                    <i class="bi bi-stars"></i>
                                    <span>Ask AI About This Table</span>
                                </div>
                                <div class="sqt-ai-quick-actions">
                                    <button type="button" class="sqt-ai-quick-btn" data-question="usage" \${!aiConfigured ? 'disabled title="Configure AI settings first"' : ''}>
                                        <i class="bi bi-question-circle"></i> What is this table used for?
                                    </button>
                                    <button type="button" class="sqt-ai-quick-btn" data-question="sample" \${!aiConfigured ? 'disabled title="Configure AI settings first"' : ''}>
                                        <i class="bi bi-code-square"></i> Show me a sample query
                                    </button>
                                    <button type="button" class="sqt-ai-quick-btn" data-question="join" \${!aiConfigured ? 'disabled title="Configure AI settings first"' : ''}>
                                        <i class="bi bi-diagram-3"></i> How to join with Customer?
                                    </button>
                                    <button type="button" class="sqt-ai-quick-btn" data-question="columns" \${!aiConfigured ? 'disabled title="Configure AI settings first"' : ''}>
                                        <i class="bi bi-star"></i> Most important columns?
                                    </button>
                                    <button type="button" class="sqt-ai-quick-btn" data-question="custom" \${!aiConfigured ? 'disabled title="Configure AI settings first"' : ''}>
                                        <i class="bi bi-chat-dots"></i> Ask custom question...
                                    </button>
                                </div>
                                \${!aiConfigured ? '<div class="mt-2" style="font-size: 12px; color: var(--sqt-text-muted);"><i class="bi bi-info-circle"></i> Configure AI settings to enable these features</div>' : ''}
                            </div>
                        \`;

                        // Columns section with checkboxes
                        html += \`
                            <div class="sqt-detail-section">
                                <div class="sqt-detail-section-header sqt-column-select-header">
                                    <span>Columns (\${columns.length})</span>
                                    <div class="sqt-column-select-actions">
                                        <span class="sqt-selection-count" id="selectionCount">0 selected</span>
                                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="selectAllColumns()">
                                            Select All
                                        </button>
                                        <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="clearColumnSelection()">
                                            Clear
                                        </button>
                                        <button type="button" class="sqt-btn sqt-btn-primary sqt-btn-sm" onclick="generateQueryFromSelection()" id="generateQueryBtn" disabled>
                                            <i class="bi bi-stars"></i> Generate Query
                                        </button>
                                    </div>
                                </div>
                                <table class="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th style="width: 40px;"></th>
                                            <th>Label</th>
                                            <th>Column Name</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        \${columns.map(f => \`
                                            <tr>
                                                <td>
                                                    <input type="checkbox" class="sqt-column-checkbox"
                                                           data-column="\${escapeHtml(f.id)}"
                                                           data-label="\${escapeHtml(f.label)}"
                                                           data-type="\${escapeHtml(f.dataType)}"
                                                           onchange="toggleColumnSelection(this)">
                                                </td>
                                                <td>\${escapeHtml(f.label)}</td>
                                                <td><code>\${escapeHtml(f.id)}</code></td>
                                                <td>\${escapeHtml(f.dataType)}</td>
                                            </tr>
                                        \`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        \`;

                        if (record.joins && record.joins.length > 0) {
                            html += \`
                                <div class="sqt-detail-section">
                                    <div class="sqt-detail-section-header">
                                        Joins (\${record.joins.length})
                                    </div>
                                    <table class="table table-sm mb-0">
                                        <thead>
                                            <tr>
                                                <th>Label</th>
                                                <th>Target Table</th>
                                                <th>Cardinality</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            \${record.joins.map(j => \`
                                                <tr>
                                                    <td>\${escapeHtml(j.label)}</td>
                                                    <td>
                                                        <a href="#" onclick="loadTableDetail('\${j.sourceTargetType.id}'); return false;">
                                                            \${escapeHtml(j.sourceTargetType.id)}
                                                        </a>
                                                    </td>
                                                    <td>\${escapeHtml(j.cardinality)}</td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            \`;
                        }

                        // Sample query
                        const sampleQuery = 'SELECT\\n' +
                            columns.slice(0, 10).map((f, i, arr) => '    ' + tableId + '.' + f.id + (i < arr.length - 1 ? ',' : '')).join('\\n') +
                            (columns.length > 10 ? '\\n    -- ... and ' + (columns.length - 10) + ' more columns' : '') +
                            '\\nFROM\\n    ' + tableId;

                        html += \`
                            <div class="sqt-detail-section">
                                <div class="sqt-detail-section-header d-flex justify-content-between align-items-center">
                                    <span>Sample Query</span>
                                    <button type="button" class="sqt-btn sqt-btn-secondary sqt-btn-sm" onclick="copyQuery()">
                                        <i class="bi bi-clipboard"></i> Copy
                                    </button>
                                </div>
                                <pre id="sampleQuery" style="margin: 0; padding: 16px; background: var(--sqt-bg-secondary); font-size: 12px; overflow-x: auto;">\${escapeHtml(sampleQuery)}</pre>
                            </div>
                        \`;

                        detail.innerHTML = html;
                    } catch (error) {
                        detail.innerHTML = '<div class="alert alert-danger">Failed to load table details.</div>';
                    }
                }

                // ===========================================
                // COLUMN SELECTION
                // ===========================================
                function toggleColumnSelection(checkbox) {
                    const columnId = checkbox.dataset.column;
                    if (checkbox.checked) {
                        selectedColumns.add(columnId);
                    } else {
                        selectedColumns.delete(columnId);
                    }
                    updateSelectionCount();
                }

                function selectAllColumns() {
                    document.querySelectorAll('.sqt-column-checkbox').forEach(cb => {
                        cb.checked = true;
                        selectedColumns.add(cb.dataset.column);
                    });
                    updateSelectionCount();
                }

                function clearColumnSelection() {
                    document.querySelectorAll('.sqt-column-checkbox').forEach(cb => {
                        cb.checked = false;
                    });
                    selectedColumns.clear();
                    updateSelectionCount();
                }

                function updateSelectionCount() {
                    const count = selectedColumns.size;
                    document.getElementById('selectionCount').textContent = count + ' selected';
                    document.getElementById('generateQueryBtn').disabled = count === 0 || !isAIConfigured();
                }

                // ===========================================
                // AI SETTINGS
                // ===========================================
                function loadAISettings() {
                    try {
                        const saved = localStorage.getItem(AI_SETTINGS_KEY);
                        return saved ? JSON.parse(saved) : null;
                    } catch (e) {
                        return null;
                    }
                }

                function saveAISettings() {
                    const provider = document.getElementById('aiProvider').value;
                    const model = document.getElementById('aiModel').value;
                    const apiKey = document.getElementById('aiApiKey').value;

                    if (!provider || !model || !apiKey) {
                        showToast('error', 'Missing Fields', 'Please fill in all fields.');
                        return;
                    }

                    const settings = { provider, model, apiKey };
                    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));

                    bootstrap.Modal.getInstance(document.getElementById('aiSettingsModal')).hide();
                    showToast('success', 'Settings Saved', 'AI settings have been saved.');
                }

                function showAISettings() {
                    const settings = loadAISettings();
                    if (settings) {
                        document.getElementById('aiProvider').value = settings.provider || '';
                        updateAIModels();
                        setTimeout(() => {
                            document.getElementById('aiModel').value = settings.model || '';
                        }, 50);
                        document.getElementById('aiApiKey').value = settings.apiKey || '';
                    }
                    new bootstrap.Modal(document.getElementById('aiSettingsModal')).show();
                }

                function updateAIModels() {
                    const provider = document.getElementById('aiProvider').value;
                    const modelSelect = document.getElementById('aiModel');
                    modelSelect.innerHTML = '<option value="">Select model...</option>';

                    if (provider && AI_MODELS[provider]) {
                        AI_MODELS[provider].forEach(model => {
                            const option = document.createElement('option');
                            option.value = model.id;
                            option.textContent = model.name;
                            modelSelect.appendChild(option);
                        });
                    }
                }

                function isAIConfigured() {
                    const settings = loadAISettings();
                    return settings && settings.provider && settings.model && settings.apiKey;
                }

                // ===========================================
                // AI TABLE SEARCH (Find the Right Table)
                // ===========================================
                async function findTablesWithAI() {
                    const input = document.getElementById('aiSearchInput');
                    const query = input.value.trim();
                    const resultsDiv = document.getElementById('aiSearchResults');
                    const btn = document.getElementById('aiSearchBtn');

                    if (!query) {
                        showToast('warning', 'Empty Query', 'Please describe what data you need.');
                        return;
                    }

                    const settings = loadAISettings();
                    if (!settings || !settings.apiKey) {
                        showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                        showAISettings();
                        return;
                    }

                    // Show loading state
                    btn.disabled = true;
                    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Searching...';
                    resultsDiv.classList.add('active');
                    resultsDiv.innerHTML = '<div class="sqt-ai-loading"><span class="spinner-border spinner-border-sm"></span> AI is analyzing your request...</div>';

                    try {
                        // Get list of available tables for context
                        const tableNames = allTables.slice(0, 100).map(t => t.id).join(', ');

                        const messages = [{
                            role: 'user',
                            content: \`I need to find the right NetSuite tables for this requirement: "\${query}"

Available tables include (partial list): \${tableNames}

Please suggest the most relevant tables for my needs. For each suggested table:
1. Provide the exact table name (ID)
2. Briefly explain why it's relevant
3. Mention any related tables I might need to join

Format your response as a simple list. Keep explanations brief.\`
                        }];

                        const response = await fetch(SCRIPT_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                function: 'aiGenerateQuery',
                                provider: settings.provider,
                                apiKey: settings.apiKey,
                                model: settings.model,
                                mode: 'tables',
                                messages: messages
                            })
                        });

                        const data = await response.json();

                        if (data.error) {
                            resultsDiv.innerHTML = \`<div class="alert alert-danger mb-0">\${escapeHtml(data.error.message)}</div>\`;
                        } else {
                            // Parse and display AI response
                            const aiResponse = data.response;
                            resultsDiv.innerHTML = \`
                                <div style="margin-bottom: 8px; font-weight: 600; color: var(--sqt-text-primary);">
                                    <i class="bi bi-stars"></i> AI Suggestions
                                </div>
                                <div class="sqt-ai-response-content">\${formatAIResponse(aiResponse)}</div>
                            \`;

                            // Try to extract table names and make them clickable
                            makeTableNamesClickable(resultsDiv);
                        }
                    } catch (error) {
                        resultsDiv.innerHTML = \`<div class="alert alert-danger mb-0">Error: \${escapeHtml(error.message)}</div>\`;
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="bi bi-stars"></i> Find Tables';
                    }
                }

                function makeTableNamesClickable(container) {
                    const tableIds = allTables.map(t => t.id.toLowerCase());
                    const content = container.querySelector('.sqt-ai-response-content');
                    if (!content) return;

                    // Find table names in the response and make them clickable
                    allTables.forEach(table => {
                        const regex = new RegExp('\\\\b' + table.id + '\\\\b', 'gi');
                        content.innerHTML = content.innerHTML.replace(regex, (match) => {
                            return \`<a href="#" class="sqt-ai-suggested-table-name" onclick="loadTableDetail('\${table.id}'); return false;">\${match}</a>\`;
                        });
                    });
                }

                // ===========================================
                // AI CHAT FOR TABLE QUESTIONS
                // ===========================================
                function askAIQuestion(question) {
                    if (!isAIConfigured()) {
                        showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                        showAISettings();
                        return;
                    }

                    // Clear previous conversation and start fresh
                    aiConversation = [];
                    openAIChatWithContext();

                    // Set the question and send
                    setTimeout(() => {
                        document.getElementById('aiChatInput').value = question;
                        sendAIChatMessage();
                    }, 300);
                }

                function openAIChatWithContext() {
                    if (!currentTable || !currentTableData) {
                        showToast('warning', 'No Table Selected', 'Please select a table first.');
                        return;
                    }

                    // Clear and reset conversation
                    aiConversation = [];
                    renderAIMessages();

                    // Open modal
                    new bootstrap.Modal(document.getElementById('aiChatModal')).show();

                    // Focus input
                    setTimeout(() => {
                        document.getElementById('aiChatInput').focus();
                    }, 300);
                }

                async function sendAIChatMessage() {
                    const input = document.getElementById('aiChatInput');
                    const message = input.value.trim();
                    const sendBtn = document.getElementById('aiSendBtn');

                    if (!message) return;

                    const settings = loadAISettings();
                    if (!settings || !settings.apiKey) {
                        showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                        return;
                    }

                    // Add context about the current table if this is the first message
                    let contextMessage = message;
                    if (aiConversation.length === 0 && currentTableData) {
                        const columns = currentTableData.fields.filter(f => f.isColumn);
                        const joins = currentTableData.joins || [];

                        contextMessage = \`I'm looking at the '\${currentTable}' table in NetSuite.

Table Info:
- Label: \${currentTableData.label}
- Columns (\${columns.length}): \${columns.slice(0, 20).map(c => c.id).join(', ')}\${columns.length > 20 ? '...' : ''}
- Available Joins: \${joins.length > 0 ? joins.map(j => j.sourceTargetType.id).join(', ') : 'None listed'}

My question: \${message}\`;
                    }

                    // Add user message
                    aiConversation.push({ role: 'user', content: contextMessage, displayContent: message });
                    renderAIMessages();

                    // Clear input
                    input.value = '';

                    // Show loading state
                    sendBtn.disabled = true;
                    addLoadingMessage();

                    try {
                        const response = await fetch(SCRIPT_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                function: 'aiGenerateQuery',
                                provider: settings.provider,
                                apiKey: settings.apiKey,
                                model: settings.model,
                                mode: 'tables',
                                messages: aiConversation.map(m => ({ role: m.role, content: m.content }))
                            })
                        });

                        const data = await response.json();

                        // Remove loading message
                        removeLoadingMessage();

                        if (data.error) {
                            aiConversation.push({ role: 'assistant', content: 'Error: ' + data.error.message });
                        } else {
                            aiConversation.push({ role: 'assistant', content: data.response });
                        }

                        renderAIMessages();

                    } catch (error) {
                        removeLoadingMessage();
                        aiConversation.push({ role: 'assistant', content: 'Error: ' + error.message });
                        renderAIMessages();
                    } finally {
                        sendBtn.disabled = false;
                    }
                }

                function renderAIMessages() {
                    const container = document.getElementById('aiMessages');

                    if (aiConversation.length === 0) {
                        container.innerHTML = \`
                            <div class="sqt-ai-settings-notice">
                                <i class="bi bi-chat-dots" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                                <p>Ask any question about the <strong>\${escapeHtml(currentTable || 'selected')}</strong> table.</p>
                            </div>
                        \`;
                        return;
                    }

                    container.innerHTML = aiConversation.map(msg => \`
                        <div class="sqt-ai-message \${msg.role}">
                            <div class="sqt-ai-message-content">
                                \${msg.role === 'assistant' ? formatAIResponse(msg.content) : escapeHtml(msg.displayContent || msg.content)}
                            </div>
                        </div>
                    \`).join('');

                    // Scroll to bottom
                    container.scrollTop = container.scrollHeight;
                }

                function addLoadingMessage() {
                    const container = document.getElementById('aiMessages');
                    const loadingDiv = document.createElement('div');
                    loadingDiv.id = 'aiLoadingMsg';
                    loadingDiv.className = 'sqt-ai-loading';
                    loadingDiv.innerHTML = '<span class="spinner-border spinner-border-sm"></span> AI is thinking...';
                    container.appendChild(loadingDiv);
                    container.scrollTop = container.scrollHeight;
                }

                function removeLoadingMessage() {
                    const loading = document.getElementById('aiLoadingMsg');
                    if (loading) loading.remove();
                }

                function handleAIChatKeydown(event) {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendAIChatMessage();
                    }
                }

                // ===========================================
                // GENERATE QUERY FROM SELECTION
                // ===========================================
                async function generateQueryFromSelection() {
                    if (selectedColumns.size === 0) {
                        showToast('warning', 'No Columns Selected', 'Please select at least one column.');
                        return;
                    }

                    if (!isAIConfigured()) {
                        showToast('warning', 'AI Not Configured', 'Please configure AI settings first.');
                        showAISettings();
                        return;
                    }

                    const settings = loadAISettings();
                    const columns = Array.from(selectedColumns);
                    const columnDetails = [];

                    // Gather column details
                    document.querySelectorAll('.sqt-column-checkbox:checked').forEach(cb => {
                        columnDetails.push({
                            id: cb.dataset.column,
                            label: cb.dataset.label,
                            type: cb.dataset.type
                        });
                    });

                    // Get join info
                    const joins = currentTableData.joins || [];

                    // Open chat and send request
                    aiConversation = [];
                    openAIChatWithContext();

                    const question = \`Generate a practical SuiteQL query using the '\${currentTable}' table with these selected columns:

\${columnDetails.map(c => \`- \${c.id} (\${c.label}, \${c.type})\`).join('\\n')}

Available joins: \${joins.length > 0 ? joins.map(j => j.sourceTargetType.id).join(', ') : 'None listed'}

Please:
1. Include the selected columns in the SELECT clause
2. Add appropriate WHERE conditions based on common use cases
3. Suggest any useful joins if relevant to these columns
4. Add an ORDER BY clause if appropriate
5. Include comments explaining the query\`;

                    setTimeout(() => {
                        document.getElementById('aiChatInput').value = question;
                        sendAIChatMessage();
                    }, 300);
                }

                // ===========================================
                // UTILITY FUNCTIONS
                // ===========================================
                function formatAIResponse(content) {
                    if (!content) return '';

                    // Escape HTML first
                    let formatted = escapeHtml(content);

                    // Format code blocks
                    formatted = formatted.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
                        return \`<pre style="position: relative;"><code>\${code.trim()}</code><button type="button" class="sqt-ai-copy-btn" onclick="copyCodeBlock(this)">Copy</button></pre>\`;
                    });

                    // Format inline code
                    formatted = formatted.replace(/\`([^\`]+)\`/g, '<code>$1</code>');

                    // Format bold
                    formatted = formatted.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');

                    // Format line breaks
                    formatted = formatted.replace(/\\n/g, '<br>');

                    return formatted;
                }

                function copyCodeBlock(button) {
                    const pre = button.parentElement;
                    const code = pre.querySelector('code').textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        button.textContent = 'Copied!';
                        setTimeout(() => button.textContent = 'Copy', 2000);
                    });
                }

                function copyQuery() {
                    const query = document.getElementById('sampleQuery').textContent;
                    navigator.clipboard.writeText(query).then(() => {
                        showToast('success', 'Copied', 'Query copied to clipboard!');
                    });
                }

                function escapeHtml(text) {
                    if (text === null || text === undefined) return '';
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }

                // ===========================================
                // INITIALIZATION
                // ===========================================

                // Move modals to body root to avoid z-index/overflow issues with NetSuite
                document.addEventListener('DOMContentLoaded', () => {
                    const modals = document.querySelectorAll('.modal');
                    modals.forEach(modal => {
                        document.body.appendChild(modal);
                    });
                });

                // Handle AI quick question button clicks using event delegation
                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('.sqt-ai-quick-btn[data-question]');
                    if (!btn || btn.disabled) return;

                    const questionType = btn.dataset.question;
                    if (!currentTable) {
                        showToast('warning', 'No Table Selected', 'Please select a table first.');
                        return;
                    }

                    const questions = {
                        usage: 'What is the ' + currentTable + ' table typically used for in NetSuite?',
                        sample: 'Show me a practical sample query using the ' + currentTable + ' table with its most useful columns.',
                        join: 'How do I join the ' + currentTable + ' table with the Customer table?',
                        columns: 'What are the most important columns in the ' + currentTable + ' table and what do they contain?',
                        custom: null
                    };

                    if (questionType === 'custom') {
                        openAIChatWithContext();
                    } else if (questions[questionType]) {
                        askAIQuestion(questions[questionType]);
                    }
                });

                loadTables();
            <\/script>
        </body>
        </html>
    `;
}