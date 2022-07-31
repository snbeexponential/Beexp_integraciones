/**
 * @author Daniel Mérida <daniel.merida@beexponential.com.mx>
 * @actualizacion Carlos Flores <carlos.flores@beexponential.com.mx>
 * @Name fig_rl_pagos_prueba.js
 * @description Esta hace una transformacion de facturas a pagos
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define(['N/record', 'N/format'], function (record, format) {   
    const entry_point = {
        get: null,
        post: null,
        put: null,
        delete: null
   };
    const response = {
        code: 200,
        message: "",
        result: []
    };    
    entry_point.post = (context) => {
        try {            
            context.forEach(function (pago) {
                let objPayments = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: pago.id,
                    toType: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });                
                objPayments.setValue({ fieldId: 'paymentoption', value: pago.paymentmethod });
                objPayments.setValue({ fieldId: 'trandate', value: new Date(pago.trandate) });
                const sublistId = 'apply';
                let totalCount = objPayments.getLineCount({ sublistId: sublistId });
                for (let index = 0; index < totalCount; index++) {
                    objPayments.selectLine({ sublistId: sublistId, line: index });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'apply', value: true });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'amount', value: pago.amount });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'due', value: pago.amount });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'total', value: pago.amount });
                    objPayments.commitLine({ sublistId: sublistId });                    
                }                
                var id = objPayments.save({ enableSourcing: true, ignoreMandatoryFields: true });                
                response.result.push({
                    invoice: pago.id,
                    pago: id
                });
            });
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
        return response;        
    }
    entry_point.get = (context) => {return 'get';}
    entry_point.put = (context) => {return 'put';}
    entry_point.delete = (context) => {return 'delete';}
    return entry_point;    
 });