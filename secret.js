/**
 * @file secret.js
 * @description
 * This file stores OAuth credentials used to authenticate remote RESTlet calls between NetSuite accounts.
 * Each entry represents a separate account configuration, identified by its `realm`.
 *
 * These credentials are used by scripts such as Suitelets to securely sign and forward SuiteQL queries
 * to RESTlets in remote accounts.
 *
 * IMPORTANT:
 * - This file must be stored in a secure folder in the File Cabinet.
 * - File permissions should restrict access to **Administrators only**.
 * - Do NOT expose or reference this file from any client-side script.
 * - Do NOT deploy this script as a RESTlet or Suitelet itself.
 *
 * @module secret
 * @returns {Array<Object>} Array of account credential objects
 * @example
 * {
 *   realm: '13.7',
 *   consumer: {
 *     key: '0123456789abcdef...',
 *     secret: 'abcdef0123456789...'
 *   },
 *   token: {
 *     id: 'fedcba9876543210...',
 *     secret: '1234567890abcdef...'
 *   }
 * }
 */
define([], function() {
    return [
        {
            realm: '1337',
            consumer: {
                name: 'SuiteQL',
                key: '0123456789',
                secret: '0123456789'
            },
            token: {
                name: 'SuiteQL - User, Role',
                id: '0123456789',
                secret: '0123456789'
            }
        },
        {
            realm: '1337_SB1',
            consumer: {
                name: 'SuiteQl',
                key: '0123456789',
                secret: '0123456789'
            },
            token: {
                name: 'SuiteQL - User, Role',
                id: '0123456789',
                secret: '0123456789'
            }
        },
        ,
        {
            realm: '1337_SB2',
            consumer: {
                name: 'SuiteQl',
                key: '0123456789',
                secret: '0123456789'
            },
            token: {
                name: 'SuiteQL - User, Role',
                id: '0123456789',
                secret: '0123456789'
            }
        }
    ]
});
