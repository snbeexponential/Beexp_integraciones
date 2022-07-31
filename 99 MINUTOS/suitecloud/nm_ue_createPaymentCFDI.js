/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/record','N/http','N/ui/dialog'],
 /**
* @param{record} record
*/
 (record,http,dialog) => {
     /**
      * Defines the function definition that is executed before record is loaded.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @param {Form} scriptContext.form - Current form
      * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
      * @since 2015.2
      */
     const beforeLoad = (scriptContext) => {
        var idInvoice;
        var nrecord=scriptContext.newRecord;
        log.debug("",)
        var type= scriptContext.type;
       	log.debug("",)
        var form = scriptContext.form;
        log.debug("",)
        var request = scriptContext.request;
        log.debug("",)
        var idFacturation=nrecord.custbody_facturama_id;
        
        /* && idFacturation!=true  */
        if (type==="view" ) {
            idInvoice=nrecord.id;  
            form.clientScriptModulePath = './nm_cs_funciones_cfdi.js';
            form.addButton({
                id : 'custpage_cfdi',
                label : 'Generar CFDI',
                functionName:"solcitandoPayment("+idInvoice+")"
            });
        }
        
     }


     /**
      * Defines the function definition that is executed before record is submitted.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {Record} scriptContext.oldRecord - Old record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @since 2015.2
      */
     const beforeSubmit = (scriptContext) => {
     }

     /**
      * Defines the function definition that is executed after record is submitted.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {Record} scriptContext.oldRecord - Old record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @since 2015.2
      */
     const afterSubmit = (scriptContext) => {
     }
     return {beforeLoad, beforeSubmit, afterSubmit}

 });
