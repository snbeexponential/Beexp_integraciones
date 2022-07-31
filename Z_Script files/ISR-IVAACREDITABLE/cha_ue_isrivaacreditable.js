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
                    type: 'customrecord_isr_iva_acreditable',
                    id: context.newRecord.id,
                    isDynamic: true,
                });
                const lines_bill = cRecord.getLineCount({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent'
                });
                log.debug('lines_bill', lines_bill);
                let csvCVClient = "NUMERO DE FACTURA ,NUMERO DE TRANSACCION ,FECHA DE FACTURA ,CUENTA ,ID PROVEEDOR ,NOMBRE DEL PROVEEDOR ,RFC ,MONEDA ,ESTADO DE LA FACTURA ,UUID ,PAIS ,TIPO DE OPERACION ,TIPO DE TERCERO ,BASE GRAVADA 16 ,BASE TASA 0 ,BASE EXENTA ,BASE NO AFECTOS DE IVA ,BASE IEPS 8 ,BASE IEPS 26 ,BASE IEPS 30 ,BASE IEPS 53 ,SUBTOTAL ANTES DE IMP,DESCUENTO ANTES DE IMPUESTOS ,IMPUESTO AL 16% ,IVA RETENIDO POR HONORARIOS ,IVA RETENIDO POR ARRENDAMIENTO ,IVA RETENIDO POR FLETES ,IVA RETENIDO POR OUTSOURCING ,TOTAL IVA RETENIDO ,ISR RETENIDO POR HONORARIOS ,ISR RETENIDO POR ARRENDAMIENTO ,ISR RETENIDO POR FRESICO ,TOTAL ISR RETENIDO ,IMPUESTOS SOBRE NÓMINA RETENIDA ,NETO FACTURA ,MONTO ANTICIPO ,IVA DE ANTICIPO ,NÍMERO DE OPERACION DEL ANTICIPO ,FECHA PAGO ANTICIPO ,TIPO PAGO DE ANTICIPO ,NO. DE FOLIO ANTICIPO ,FECHA PAGO FACTURA ,NUMERO DE CHEQUE ,ESTADO DE CHEQUE ,TIPO PAGO ,POLIZA ,FECHA DE POLIZA,\n"
                for (let i = 0; i < lines_bill; i++) {
                    const type_tran = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_tipo_transaccion', line: i });
                    const ref_No = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_num_factura_iva_acreditable_d', line: i });
                    const transaction_number = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_num_tran_iva_acreditable_deta', line: i });
                    const inv_date = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_fecha_factura_iva_acreditable', line: i });
                    const inv_account = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_cuenta_iva_acreditable_detall', line: i });
                    const inv_vendor_id = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_id_pro_iva_acreditable_detall', line: i });
                    const inv_vendor_name = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_nombre_prov_iva_acreditable', line: i });
                    const inv_vendor_rfc = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_rfc_iva_acreditable_detalle', line: i });
                    const inv_currency = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_moneda_iva_acreditable_detall', line: i });
                    const inv_status = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_estado_factura_iva_acreditabl', line: i });
                    const inv_uuid = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_uuid_iva_acreditable_detalle', line: i });
                    const inv_vendor_pais = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_pais_iva_acreditable_detalle', line: i });
                    const inv_vendor_operation_type = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_tipo_op_iva_acreditable', line: i });
                    const inv_vendor_type_ter = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_tipo_ter_iva_acreditable_deta', line: i });
                    const base_tasa_16 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_gravada_16', line: i });
                    const base_tasa_0 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_tasa_0', line: i });
                    const base_exenta = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_exenta_iva_acreditable', line: i });
                    const base_afectos_iva = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_no_afectos_iva_acreditab', line: i });
                    const base_ieps_8 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_ieps_8_iva_acreditable', line: i });
                    const base_ieps_26 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_ieps_26_iva_acreditable', line: i });
                    const base_ieps_30 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_ieps_30_iva_acreditable', line: i });
                    const base_ieps_53 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_base_ieps_53_iva_acreditable', line: i });
                    const subtotalantesdeimp = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_sub_antes_imp_iva_acreditable', line: i });
                    const descantesdeimp = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_desc_antes_imp_iva_acreditabe', line: i });
                    const imp_16 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_16_iva_acreditable', line: i });
                    const imp_ieps_8 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_ieps_8_iva_acreditable', line: i });
                    const imp_ieps_26 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_ieps_26_iva_acreditable', line: i });
                    const imp_ieps_30 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_ieps_30_iva_acreditable', line: i });
                    const imp_ieps_53 = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_ieps_53_iva_acreditable', line: i });
                    const iva_ret_hor = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_iva_ret_hon_iva_acreditable', line: i });
                    const iva_ret_arre = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_iva_ret_arre_iva_acreditable', line: i });
                    const iva_ret_fletes = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_iva_ret_fletes_iva_acreditabl', line: i });
                    const iva_ret_outsourcing = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_iva_ret_out_iva_acreditable', line: i });
                    const total_iva_ret = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_total_iva_ret_iva_acreditable', line: i });
                    const isr_ret_hon = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_isr_ret_hon_iva_acreditable', line: i });
                    const isr_ret_arren = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_isr_ret_arre_iva_acreditable', line: i });
                    const isr_ret_resico = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_isr_ret_resi_iva_acreditable', line: i });
                    const total_isr_ret = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_total_isr_ret_iva_acreditable', line: i });
                    const impsobrenomret = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_imp_nom_ret_iva_acreditable', line: i });
                    const netofactura = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_neto_factura_iva_acreditable', line: i });
                    const montoanticipo = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_monto_ant_iva_acreditable', line: i });
                    const ivadeanticipo = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_iva_ant_iva_acreditable', line: i });
                    const numdeopdelant = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_num_op_ant_iva_acreditable', line: i });
                    const fechapagoanticipo = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_fec_pago_ant_iva_acreditable', line: i });
                    const tipopagodeanticipo = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_tipo_pago_ant_iva_acreditable', line: i });
                    const nodefolioanticipo = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_num_folio_ant_iva_acreditable', line: i });
                    const fechapagfactura = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_fec_pag_factura', line: i });
                    const numerodecheque = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_num_cheque_iva_acreditable', line: i });
                    const estadodecheque = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_estado_cheque_iva_acreditable', line: i });
                    const tipopago = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_tipo_pago_iva_acreditable', line: i });
                    const poliza = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_poliza_iva_acreditable', line: i });
                    const fechadepoliza = cRecord.getSublistText({ sublistId: 'recmachcustrecord_iva_acreditable_parent', fieldId: 'custrecord_fecha_poliza_iva_acreditable', line: i });

                    csvCVClient +=
                        ref_No + ","
                        + transaction_number + ","
                        + inv_date + ","
                        + inv_account + ","
                        + inv_vendor_id + ","
                        + inv_vendor_name + ","
                        + inv_vendor_rfc + ","
                        + inv_currency + ","
                        + inv_status + ","
                        + inv_uuid + ","
                        + inv_vendor_pais + ","
                        + inv_vendor_operation_type + ","
                        + inv_vendor_type_ter + ","
                        + base_tasa_16 + ","
                        + base_tasa_0 + ","
                        + base_exenta + ","
                        + base_afectos_iva + ","
                        + base_ieps_8 + ","
                        + base_ieps_26 + ","
                        + base_ieps_30 + ","
                        + base_ieps_53 + ","
                        + subtotalantesdeimp + ","
                        + descantesdeimp + ","
                        + imp_16 + ","
                        + iva_ret_hor + ","
                        + iva_ret_arre + ","
                        + iva_ret_fletes + ","
                        + iva_ret_outsourcing + ","
                        + total_iva_ret + ","
                        + isr_ret_hon + ","
                        + isr_ret_arren + ","
                        + isr_ret_resico + ","
                        + total_isr_ret + ","
                        + impsobrenomret + ","
                        + netofactura + ","
                        + montoanticipo + ","
                        + ivadeanticipo + ","
                        + numdeopdelant + ","
                        + fechapagoanticipo + ","
                        + tipopagodeanticipo + ","
                        + nodefolioanticipo + ","
                        + fechapagfactura + ","
                        + numerodecheque + ","
                        + estadodecheque + ","
                        + tipopago + ","
                        + poliza + ","
                        + fechadepoliza + "\n"
                }

                var transactionSearchObj = search.create({
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
                       search.createColumn({name: "internalid", label: "Internal ID"}),
                       search.createColumn({name: "custbody_bex_pagosoperacion", label: "Operación"}),
                       search.createColumn({name: "entity", label: "Name"}),
                       search.createColumn({name: "custbody_bex_pagosctaorigen", label: "Cuenta Origen  Banorte"}),
                       search.createColumn({name: "custbody_beex_pagoctadestino", label: "Cuenta Destino Banorte"}),
                       search.createColumn({name: "amount", label: "Amount"}),
                       search.createColumn({name: "custbody_beex_referenciapago", label: "Referencia Pago"}),
                       search.createColumn({
                          name: "tranid",
                          sort: search.Sort.ASC,
                          label: "Concepto Banorte"
                       })
                    ]
                 });
                 var searchResultCount = transactionSearchObj.runPaged().count;
                 log.debug("transactionSearchObj result count",searchResultCount);
                 transactionSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    return true;
                 });
                 
                 /*
                 transactionSearchObj.id="customsearch1657053625572";
                 transactionSearchObj.title="MYT - Pagos BANORTE (copy)";
                 var newSearchId = transactionSearchObj.save();
                 */





                csvCVClient = encode.convert({
                    string: csvCVClient,
                    inputEncoding: encode.Encoding.UTF_8,
                    outputEncoding: encode.Encoding.BASE_64
                });

                context.form.addButton({ id: 'custpage_print', label: 'Generar Excel', functionName: "print('" + csvCVClient + "')" });
            }
            context.form.clientScriptModulePath = './cha_cs_isrivaacreditable.js';
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
                var parameters = {
                    type: cNewRecord.type,
                    id: cNewRecord.id,
                    initial_date: format.format({ value: cNewRecord.getValue('custrecord_fec_inicial_iva_acreditable'), type: format.Type.DATE }),
                    finish_date: format.format({ value: cNewRecord.getValue('custrecord_fec_final_iva_acreditable'), type: format.Type.DATE }),
                    subsidiary: cNewRecord.getValue('custrecord_sub_iva_acreditable')
                };
                record.submitFields({
                    type: cNewRecord.type,
                    id: cNewRecord.id,
                    values: {
                        custrecord_estado_iva_acreditable: "Procesando..."
                    }
                });
                var scheduledTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_cha_mr_ivaacreitable',
                    deploymentId: 'customdeploy_cha_mr_ivaacreitable',
                    params: { 'custscript_bex_mr_isr_ivaacreditable': JSON.stringify(parameters) }
                }).submit();
            }
        }

        return { beforeLoad, beforeSubmit, afterSubmit }

    });
