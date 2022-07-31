/**
* @author Evelyn Sarmiento Cámbara <evelyn.sarmiento@beexponential.com>
* @Modificacion <>
* @Name ac_rl_intcustomer.js
* @description Script RESTlet de netsuite a intelisis
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/https', 'N/encode', 'N/file', 'N/record'], function (https, encode, file, record) {
    function postRequest(params) {
        log.debug('test','testestes')
        log.debug("params", params);
        // var dynamicid2 = Object.values(params);
        // log.debug("dynamicid2", dynamicid2);
        // var data = dynamicid2[0];
        // log.debug("data", data);

    }

    return {
        post: postRequest
    }
});