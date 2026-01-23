/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * @author Budy Sutjijati <budy@sutjijati.nl>
 * @file suiteql_proxy.js
 *
 *
 * Version    Date           Author                Remarks
 * 1.0        23 Jan 2026    Budy Sutjijati        Initial version.
 *
 */
define(['N/query', 'N/log'], (query, log) => {

    /**
     * Handle POST requests to execute SuiteQL.
     * @param {Object} requestBody - Payload with query and options.
     */
    const post = (requestBody) => {
        try {
            const { query: sql, paginationEnabled, rowBegin, rowEnd, returnTotals } = requestBody;

            let records = [];
            const beginTime = Date.now();

            if (paginationEnabled) {
                records = executePaginatedQuery(sql, rowBegin || 1, rowEnd || 1000);
            } else {
                records = query.runSuiteQL({ query: sql }).asMappedResults();
            }

            const elapsedTime = Date.now() - beginTime;

            const responsePayload = {
                records,
                rowCount: records.length,
                elapsedTime
            };

            if (returnTotals && records.length > 0) {
                const countSql = `SELECT COUNT(*) AS totalrecordcount FROM (${sql})`;
                const countResult = query.runSuiteQL({ query: countSql }).asMappedResults();
                responsePayload.totalRecordCount = countResult[0]?.totalrecordcount || 0;
            }

            return responsePayload;

        } catch (e) {
            log.error({ title: 'SuiteQL Proxy Error', details: e });
            return { error: { name: e.name, message: e.message } };
        }
    };

    /**
     * Executes paginated queries.
     */
    function executePaginatedQuery(sql, rowBegin, rowEnd) {
        let results = [];
        let more = true;
        let start = rowBegin;

        while (more) {
            const paginatedSql = `
                SELECT * FROM (
                    SELECT ROWNUM AS ROWNUMBER, * FROM (${sql})
                ) WHERE ROWNUMBER BETWEEN ${start} AND ${rowEnd}
            `;

            const batch = query.runSuiteQL({ query: paginatedSql }).asMappedResults();
            results = results.concat(batch);

            if (batch.length < 5000) {
                more = false;
            }
            start += 5000;
        }

        return results;
    }

    return { post };
});