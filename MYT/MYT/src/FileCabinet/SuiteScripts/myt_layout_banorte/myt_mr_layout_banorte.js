/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/format'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, runtime, search, format) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            log.debug("Dentro de getInputData")
          
                  const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_myt_mr_layout_banortepm' }));
                  const tran_type = parameters.type;
                  const tran_id = parameters.id;

            let id_tran = [];
            let id_tran2=["4113571","4096246","4111368","4111438"];


            let transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                   ["mainline","is","T"], 
                   "AND", 
                   ["type","anyof","VendBill"], 
                   "AND", 
                   ["employee","anyof","@ALL@"], 
                   "AND", 
                   ["unitstype","anyof","@ALL@"], 
                   "AND", 
                   ["status","anyof","VendBill:A"]
                ],
                columns:
                [
                   search_id="internalid",
                ]
             });
            const pagedData1 = transactionSearchObj.runPaged({ pageSize: 1000 });
            log.debug("Total datos resultados",pagedData1.pageRanges.length)
            for (let i = 0; i < pagedData1.pageRanges.length; i++) {
                let currentPage1 = pagedData1.fetch(i);
                currentPage1.data.forEach(function (result) {
                    id_tran.push(result.getValue(search_id));
                });
            }
            log.debug("id_tran",id_tran)
            return id_tran2; 
        }

    /**
     * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
     * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
     * context.
     * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
     *     is provided automatically based on the results of the getInputData stage.
     * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
     *     function on the current key-value pair
     * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
     *     pair
     * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} mapContext.key - Key to be processed during the map stage
     * @param {string} mapContext.value - Value to be processed during the map stage
     * @since 2015.2
     */
    const map = (context) => {
        log.debug("Dentro de Map",context)
        const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_myt_mr_layout_banortepm' }));
        const tran_id = parameters.id;
        const id_internal = context.value;
        log.debug("Dentro de Map 2",id_internal)
        const record_vp = record.load({
            type: 'vendorbill',
            id: parseInt(id_internal),
            isDynamic: true,
        })
        let record_pagosoperacion= record_vp.getText('custbody_bex_pagosoperacion')
        let record_entity= record_vp.getText('entity')
        let record_pagosctaorigen= record_vp.getValue('custbody_bex_pagosctaorigen')
        let record_pagoctadestino= record_vp.getValue('custbody_beex_pagoctadestino')
        let record_amount= record_vp.getValue('usertotal')
        let record_referenciapago= record_vp.getValue('custbody_beex_referenciapago')
        let record_tranid= record_vp.getValue('tranid')
    

        let editRecord = record.load({
            type:'customrecordbanorte_layout',
            id: tran_id
        });
        let numLines = editRecord.getLineCount({
            sublistId: 'recmachcustrecordconexion_padre'
        });
        log.debug("Dentro de Map 3",numLines)
        
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_id_interno",
            value:id_internal,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_operacion",
            value:record_pagosoperacion == null ?'':record_pagosoperacion,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_nombre",
            value:record_entity == null ?'':record_entity,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_cuenta_orig_banorte",
            value:record_pagosctaorigen == null ?'':record_pagosctaorigen,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_cuenta_dest_banorte",
            value:record_pagoctadestino == null ?'':record_pagoctadestino,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_importe",
            value:record_amount == null ?'':record_amount,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_referencia_pago",
            value:record_referenciapago == null ?'':record_referenciapago,
            line:numLines
        });
        editRecord.setSublistValue({
            sublistId: 'recmachcustrecordconexion_padre',
            fieldId: "custrecord_concepto_banorte",
            value:record_tranid == null ?'':record_tranid,
            line:numLines
        });
        
        log.debug("Dentro de Map 4",editRecord)
        editRecord.save({
            ignoreMandatoryFields: true
        });
        
/*         info.push({
            tran_id
        });
        log.debug("Dentro de Map 5",info) */

    }

    /**
     * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
     * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
     * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
     *     provided automatically based on the results of the map stage.
     * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
     *     reduce function on the current group
     * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
     * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} reduceContext.key - Key to be processed during the reduce stage
     * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
     *     for processing
     * @since 2015.2
     */
    const reduce = (context) => {
        log.debug("Dentro de reduce")
        // if (context.value == true) {
        //     log.debug("reduce", context.value);
        //     const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_myt_mr_layout_banortepm' }));
        //     const tran_id = parameters.id;
        //     record.submitFields({
        //         type: 'customrecord_isr_iva_acreditable',
        //         id: tran_id,
        //         values: {
        //             custrecord_estado_iva_acreditable: "Finalizado"
        //         }
        //     });
        // }
    }


    /**
     * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
     * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
     * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
     * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
     *     script
     * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
     * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
     * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
     * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
     *     script
     * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
     * @param {Object} summaryContext.inputSummary - Statistics about the input stage
     * @param {Object} summaryContext.mapSummary - Statistics about the map stage
     * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
     * @since 2015.2
     */
    const summarize = (summaryContext) => {
        log.debug("Dentro de summarize")
        const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_myt_mr_layout_banortepm' }));
        const tran_id = parameters.id;
        record.submitFields({
            type: 'customrecordbanorte_layout',
            id: tran_id,
            values: {
                custrecordestado_banorte_layout: "Finalizado"
            }
        });
    }

    return { getInputData, map, reduce, summarize }
});