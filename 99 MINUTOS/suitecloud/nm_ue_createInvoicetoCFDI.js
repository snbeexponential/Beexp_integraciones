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
//Primero cargamos el script que llamará al servicio post que se enlaza a Facturama
        var idInvoice;
        var nrecord=scriptContext.newRecord;
        var type= scriptContext.type;
        var form = scriptContext.form;
        var request = scriptContext.request;

        var idFacturation=nrecord.custbody_facturama_id;
        
        if (type==="view" /* && idFacturation!=true */) {
            idInvoice=nrecord.id;  
            form.clientScriptModulePath = './nm_cs_funciones_cfdi.js';
            form.addButton({
                id : 'custpage_cfdi',
                label : 'Generar CFDI',
                functionName:"solcitandoinvoice("+idInvoice+")"
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
