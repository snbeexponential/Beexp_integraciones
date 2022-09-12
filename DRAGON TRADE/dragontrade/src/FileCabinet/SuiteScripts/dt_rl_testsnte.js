/**
 * @author Evelyn Sarmiento Cámbara<>
 * @Modificacion <>
 * @Name ac_rl_customers.js
 * @description Script para la importacion/exportacion de Customers. URL Documentation: <pendiente>
 * @file  <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define([
    'N/log',
    'N/record',
    'N/runtime',
    "N/search",
    "N/format"
],
    function (log, record, runtime, search, format) {

        const entry_point = {
            get: null,
            post: null,
            put: null
        };

        const response = {
            code: 200,
            message: "",
            result: []
        };

        let empleadoInternalid = '';

        const CONTRATO = {
        };
        //Consulta del cliente por numero de id interno
        entry_point.get = function (request) {
            return 'h2'
        }

        //Creación del cliente
        entry_point.post = function (request) {

        }

        entry_point.put = (request) => {
        }

        return entry_point;
    });