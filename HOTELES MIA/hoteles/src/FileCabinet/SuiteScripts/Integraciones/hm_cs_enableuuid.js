/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],function() {

    const entry_point = {
      
        postSourcing: null,
        lineInit: null,
        pageInit: null,
        saveRecord: null,
        sublistChanged: null,
        validateDelete: null,
        validateField: null,
        validateInsert: null,
        validateLine: null,
  
     };
   
     entry_point.pageInit= function(scriptContext) {
        log.debug("textos")
        var invObj=scriptContext.currentRecord;
        const myRecordFieldA = invObj.getField({
            fieldId: 'custbody_mx_cfdi_uuid'
        });
        myRecordFieldA.isDisabled = false;
    }

    return entry_point;

 
    
});
