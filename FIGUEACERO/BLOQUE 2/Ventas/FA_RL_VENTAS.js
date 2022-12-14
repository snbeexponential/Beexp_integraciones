/**
 * @author Daniel Mérida <daniel.merida@beexponential.com.mx>
 * @Name fig_rl_ventas.js
 * @description crea, actualiza y obtiene una venta mediante un ID
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define([
    'N/record',
    '../libs/lib_rest_export',
    '../libs/lib_rest_module',
    'N/runtime',
    'N/log',
    'N/search'
 ], function (
    record, jsexport, jsimport, runtime, log, search
 ) {
    const entry_point = {
       get: null,
       post: null,
       put: null,
       delete: null,
    };
 
    const response = {
       code: 200,
       message: '',
       result: {}
    };
    /** 
    {
 
    }
    */
    //#region get
    entry_point.get = (context) => {
       // Autogenerated, do not edit. All changes will be undone.  
    }
    //#endregion
    //#region post
    entry_point.post = (context) => {
       // Autogenerated, do not edit. All changes will be undone.
       try {
          let request = JSON.parse(JSON.stringify(context));
          if (!request.id) {
             createOrUpdateSalesOrder(request);
             if (response.result.salesOrderId) {
                salesOrderToFulfillment(response.result.salesOrderId);
                salesOrderToInvoice(response.result.salesOrderId);
             }
          } else {
             response.code = 400;
             response.message = 'El post no es un necesario un ID';
          }
       } catch (error) {
          response.code = 400;
          response.message = error.message
          log.error({ title: 'error', details: error })
       }
       return response;
    }
    //#endregion
    //#region put
    entry_point.put = (context) => {
       // Autogenerated, do not edit. All changes will be undone.  
    }
    //#endregion
    //#region delete
    entry_point.delete = (context) => {
       // Autogenerated, do not edit. All changes will be undone.  
    }
    //#endregion
    function get(context) {
 
    }
 
    const salesOrderToFulfillment = (id) => {
       let itemFulfillmentObj = record.transform({
          fromType: record.Type.SALES_ORDER, fromId: id, toType: record.Type.ITEM_FULFILLMENT, isDynamic: false
       });
       var itemFulfillmentId = itemFulfillmentObj.save({ enableSourcing: true, ignoreMandatoryFields: true })
       response.result.fulfillmentId = itemFulfillmentId;
    }
 
    const createOrUpdateSalesOrder = (request) => {
       let container = {}
       let obj2Create = {};
 
       request.custentity_fa_created_from = runtime.getCurrentScript().id;
       if (request.id) {
          obj2Create.id = request.id;
       }
       obj2Create['recordType'] = record.Type.SALES_ORDER;
       obj2Create['isDynamic'] = true;
       obj2Create['ignoreMandatoryFields'] = true;
       obj2Create['values'] = request;
 
       let submit = jsimport.submitFieldsJS(obj2Create);
       response.result = { salesOrderId: submit.recordId };
       response.message = submit.msg;
 
       record.submitFields({ type: record.Type.SALES_ORDER, id: submit.recordId, values: { orderstatus: 'B' } });
    }
 
    const salesOrderToInvoice = (id) => {
       var objInvoice = record.transform({
          fromType: record.Type.SALES_ORDER,
          fromId: id,
          toType: record.Type.INVOICE,
          isDynamic: false
       });
       let invoiceId = objInvoice.save({ enableSourcing: true, ignoreMandatoryFields: true });
       response.result.invoiceId = invoiceId;
    }
 
    return entry_point;
    /* 
     * Insert Code here
     */
 
 });