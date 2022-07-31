/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/task', 'N/format', 'N/encode'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{task} task
 */
    (record, runtime, search, task, format, encode) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (context) => {
            if (context.type == 'view') {
                const cRecord = record.load({
                    type: 'customrecordbanorte_layout',
                    id: context.newRecord.id,
                    isDynamic: true,
                });

                log.debug("cRecord",cRecord)

                const lines_bill = cRecord.getLineCount({
                    sublistId: 'recmachcustrecordconexion_padre'
                });

                log.debug('lines_bill', lines_bill);
                let csvCVClient = "CAMPO,\n"
                for (let i = 0; i < lines_bill; i++) {
                    const type_tran = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_id_interno', line: i });
                    const ref_No = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_operacion', line: i });
                    const transaction_number = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_nombre', line: i });
                    const inv_account = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_cuenta_orig_banorte', line: i });
                    const inv_vendor_id = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: '	custrecord_cuenta_dest_banorte', line: i });
                    const inv_vendor_name = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_importe', line: i });
                    const inv_vendor_rfc = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_referencia_pago', line: i });
                    const inv_currency = cRecord.getSublistText({ sublistId: 'recmachcustrecordconexion_padre', fieldId: 'custrecord_concepto_banorte', line: i });

                    csvCVClient +=
                        ref_No + ","
                        + transaction_number + ","
                        + inv_account + ","
                        + inv_vendor_id + ","
                        + inv_vendor_name + ","
                        + inv_vendor_rfc + ","
                        + inv_currency+"\n"
                }

                csvCVClient = encode.convert({
                    string: csvCVClient,
                    inputEncoding: encode.Encoding.UTF_8,
                    outputEncoding: encode.Encoding.BASE_64
                });

                context.form.addButton({ id: 'custpage_print', label: 'Generar Excel', functionName: "print('" + csvCVClient + "')" });
            }
            context.form.clientScriptModulePath = './myt_cs_layout_banorte.js';
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (context) => {

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
            if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                var cNewRecord = scriptContext.newRecord;
                //Se comparte parametros
                log.debug("Tipo de record",cNewRecord.type)
                var parameters = {
                    type: cNewRecord.type,
                    id: cNewRecord.id,
                };
                record.submitFields({
                    type: cNewRecord.type,
                    id: cNewRecord.id,
                    values: {
                        custrecordestado_banorte_layout: "Procesando..."
                    }
                });
                

                var scheduledTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_myt_ue_layout_banortesc',
                    deploymentId: 'customdeploy_myt_ue_layout_banortedp',
                    params: {'custscript_myt_mr_layout_banortepm': JSON.stringify(parameters) }
                }).submit();
            }
        }

        return { beforeLoad, beforeSubmit, afterSubmit }

    });
