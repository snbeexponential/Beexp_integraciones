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
            const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_bex_mr_isr_ivaacreditable' }));
            const tran_type = parameters.type;
            const tran_id = parameters.id;
            const subsidiary = parameters.subsidiary;
            const initial_date = parameters.initial_date;
            const finish_date = parameters.finish_date;

            log.debug('tran_type', tran_type);
            log.debug('tran_id', tran_id);
            log.debug('subsidiary', subsidiary);
            log.debug('initial_date', initial_date);
            log.debug('finish_date', finish_date);

            let id_tran = [];
            const vendorpaymentSearchObj = search.create({
                type: "vendorpayment",
                filters:
                    [
                        ["type", "anyof", "VendPymt"],
                        "AND",
                        ["trandate", "within", initial_date, finish_date],
                        "AND",
                        ["subsidiary", "anyof", subsidiary],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"]
                    ],
                columns:
                    [
                        id_internal = search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            const pagedData1 = vendorpaymentSearchObj.runPaged({ pageSize: 1000 });
            for (let i = 0; i < pagedData1.pageRanges.length; i++) {
                let currentPage1 = pagedData1.fetch(i);
                currentPage1.data.forEach(function (result) {
                    id_tran.push(result.getValue(id_internal));
                });
            }

            log.debug('id_tran', id_tran);

            return id_tran;
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
            const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_bex_mr_isr_ivaacreditable' }));
            const tran_id = parameters.id;
            const initial_date = new Date(parameters.initial_date);
            const finish_date = new Date(parameters.finish_date);

            log.debug('Internalids send', context.value);
            const id_internal = context.value;

            const record_vp = record.load({
                type: 'vendorpayment',
                id: id_internal,
                isDynamic: true,
            })
            const transaction_type = 'vendorpayment';
            const transaction_number = record_vp.getValue('transactionnumber');
            const transaction_amount = record_vp.getValue('total');

            const lines_bill = record_vp.getLineCount({
                sublistId: 'apply'
            });

            for (let i = 0; i < lines_bill; i++) {
                const id_bill = record_vp.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: i
                });
                const record_bill = record.load({
                    type: 'vendorbill',
                    id: id_bill,
                    isDynamic: true,
                })
                const date_bill = format.format({ value: record_bill.getValue('trandate'), type: format.Type.DATE });
                const date_bill_date = new Date(date_bill);

                log.debug('initial_date', initial_date);
                log.debug('finish_date', finish_date);
                log.debug('date_bill', date_bill_date);

                const ref_No = record_bill.getValue('tranid');
                const inv_date = record_bill.getText('custbody2');
                const inv_account = record_bill.getText('account');
                const inv_vendor_id = record_bill.getValue('entity');
                const inv_vendor_name = record_bill.getText('custbody_bex_vendorname');

                const record_vendor = record.load({
                    type: 'vendor',
                    id: inv_vendor_id,
                    isDynamic: true,
                })

                const inv_vendor_rfc = record_vendor.getText('custentity_be_rfc_sat');
                const inv_currency = record_bill.getText('currency');
                const inv_status = record_vp.getText('status');
                const inv_uuid = record_bill.getText('custbody_be_uuid_sat');
                const inv_vendor_pais = record_vendor.getText('custentity_be_countrycode_sat');
                const inv_vendor_operation_type = record_vendor.getText('custentity_be_tipo_operacion');
                const inv_vendor_type_ter = record_vendor.getText('custentity_be_tipo_tercero');

                let base_tasa_16 = 0;
                const base_tasa_0 = transaction_amount;
                const base_exenta = 0;
                const base_afectos_iva = 0;
                const base_ieps_8 = (transaction_amount * 0.08).toFixed(2);
                const base_ieps_26 = (transaction_amount * 0.26).toFixed(2);
                const base_ieps_30 = (transaction_amount * 0.30).toFixed(2);
                const base_ieps_53 = (transaction_amount * 0.53).toFixed(2);

                const lines_bill_expense = record_bill.getLineCount({
                    sublistId: 'expense'
                });
                const lines_bill_item = record_bill.getLineCount({
                    sublistId: 'item'
                });

                let subtotalantesdeimp = 0;
                let descantesdeimp = 0;

                const imp_16 = 0;
                const imp_ieps_8 = 0;
                const imp_ieps_26 = 0;
                const imp_ieps_30 = 0;
                const imp_ieps_53 = 0;

                const iva_ret_hor = 0;
                const iva_ret_arre = 0;
                const iva_ret_fletes = 0;
                const iva_ret_outsourcing = 0;

                const isr_ret_hon = 0;
                const isr_ret_arren = 0;
                const isr_ret_resico = 0;

                const impsobrenomret = 0;
                const netofactura = transaction_amount;
                const montoanticipo = 0;
                const ivadeanticipo = 0;

                const numdeopdelant = 0;
                const fechapagoanticipo = 0;
                const tipopagodeanticipo = 0;
                const nodefolioanticipo = 0;

                const fechapagfactura = record_bill.getText('duedate');
                const numerodecheque = record_bill.getText('transactionnumber');
                const estadodecheque = record_bill.getText('status');
                const tipopago = record_bill.getText('custbody_be_formpayment_sat');
                const poliza = record_bill.getText('transactionnumber');
                const fechadepoliza = record_bill.getText('trandate');

                let tax_name = '';
                let amount_item = '';

                for (let i = 0; i < lines_bill_item; i++) {
                    const tax_code = record_bill.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'taxcode',
                        line: i
                    });
                    const record_taxcode = record.load({
                        type: 'salestaxitem',
                        id: tax_code,
                        isDynamic: true,
                    });
                    tax_name = record_taxcode.getValue('itemid');
                    amount_item += record_bill.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    });
                }

                if (tax_name.includes('IVA')) {
                    imp_16 = amount_item * 0.16;
                }
                if (tax_name.includes('IEPS 8%')) {
                    imp_ieps_8 = amount_item * 0.08;
                }
                if (tax_name.includes('IEPS 26%')) {
                    imp_ieps_26 = amount_item * 0.26;
                }
                if (tax_name.includes('IEPS 30%')) {
                    imp_ieps_30 = amount_item * 0.30;
                }
                if (tax_name.includes('IEPS 53%')) {
                    imp_ieps_53 = amount_item * 0.53;
                }

                if (tax_name.includes('IVA Retenido por Honorarios')) {
                    iva_ret_hor = amount_item * 0.1067;
                }
                if (tax_name.includes('IVA Retenido por Arrendamiento')) {
                    iva_ret_arre = amount_item * 0.1067;
                }
                if (tax_name.includes('IVA Retenido por Fletes')) {
                    iva_ret_fletes = amount_item * 0.04;
                }
                if (tax_name.includes('IVA Retenido por Comisiones')) {
                    iva_ret_outsourcing = amount_item * 0.1067;
                }

                if (tax_name.includes('ISR Retenido por Honorarios')) {
                    iva_ret_outsourcing = amount_item * 0.10;
                }
                if (tax_name.includes('ISR Retenido por Arrendamiento')) {
                    iva_ret_outsourcing = amount_item * 0.10;
                }
                if (tax_name.includes('ISR RETENIDO PF RESICO')) {
                    iva_ret_outsourcing = amount_item * 0.0125;
                }

                let total_iva_ret = (Number(iva_ret_hor) + Number(iva_ret_arre) + Number(iva_ret_fletes) + Number(iva_ret_outsourcing)).toFixed(2);
                let total_isr_ret = (Number(isr_ret_hon) + Number(isr_ret_arren) + Number(isr_ret_resico)).toFixed(2);

                for (let i = 0; i < lines_bill_expense; i++) {
                    subtotalantesdeimp = record_bill.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amount',
                        line: i
                    });
                    base_tasa_16 = record_bill.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'tax1amt',
                        line: i
                    });
                }

                let editRecord = record.load({
                    type: 'customrecord_isr_iva_acreditable',
                    id: tran_id
                });
                let numLines = editRecord.getLineCount({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent'
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_tipo_transaccion",
                    value: transaction_type,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_num_factura_iva_acreditable_d",
                    value: ref_No,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_num_tran_iva_acreditable_deta",
                    value: transaction_number,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_fecha_factura_iva_acreditable",
                    value: inv_date,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_cuenta_iva_acreditable_detall",
                    value: inv_account,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_id_pro_iva_acreditable_detall",
                    value: inv_vendor_id,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_nombre_prov_iva_acreditable",
                    value: inv_vendor_name,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_rfc_iva_acreditable_detalle",
                    value: inv_vendor_rfc,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_moneda_iva_acreditable_detall",
                    value: inv_currency,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_estado_factura_iva_acreditabl",
                    value: inv_status,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_uuid_iva_acreditable_detalle",
                    value: inv_uuid,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_pais_iva_acreditable_detalle",
                    value: inv_vendor_pais,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_tipo_op_iva_acreditable",
                    value: inv_vendor_operation_type,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_tipo_ter_iva_acreditable_deta",
                    value: inv_vendor_type_ter,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_gravada_16",
                    value: base_tasa_16,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_tasa_0",
                    value: base_tasa_0,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_exenta_iva_acreditable",
                    value: base_exenta,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_no_afectos_iva_acreditab",
                    value: base_afectos_iva,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_ieps_8_iva_acreditable",
                    value: base_ieps_8,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "	custrecord_base_ieps_26_iva_acreditable",
                    value: base_ieps_26,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_ieps_30_iva_acreditable",
                    value: base_ieps_30,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_base_ieps_53_iva_acreditable",
                    value: base_ieps_53,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_sub_antes_imp_iva_acreditable",
                    value: subtotalantesdeimp,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_desc_antes_imp_iva_acreditabe",
                    value: descantesdeimp,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_16_iva_acreditable",
                    value: imp_16,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_ieps_8_iva_acreditable",
                    value: imp_ieps_8,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_ieps_26_iva_acreditable",
                    value: imp_ieps_26,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_ieps_30_iva_acreditable",
                    value: imp_ieps_30,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_ieps_53_iva_acreditable",
                    value: imp_ieps_53,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_iva_ret_hon_iva_acreditable",
                    value: iva_ret_hor,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_iva_ret_arre_iva_acreditable",
                    value: iva_ret_arre,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_iva_ret_fletes_iva_acreditabl",
                    value: iva_ret_fletes,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_iva_ret_out_iva_acreditable",
                    value: iva_ret_outsourcing,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_total_iva_ret_iva_acreditable",
                    value: total_iva_ret,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_isr_ret_hon_iva_acreditable",
                    value: isr_ret_hon,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_isr_ret_arre_iva_acreditable",
                    value: isr_ret_arren,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_isr_ret_resi_iva_acreditable",
                    value: isr_ret_resico,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_total_isr_ret_iva_acreditable",
                    value: total_isr_ret,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_imp_nom_ret_iva_acreditable",
                    value: impsobrenomret,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_neto_factura_iva_acreditable",
                    value: netofactura,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_monto_ant_iva_acreditable",
                    value: montoanticipo,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_iva_ant_iva_acreditable",
                    value: ivadeanticipo,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_num_op_ant_iva_acreditable",
                    value: numdeopdelant,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_fec_pago_ant_iva_acreditable",
                    value: fechapagoanticipo,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_tipo_pago_ant_iva_acreditable",
                    value: tipopagodeanticipo,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_num_folio_ant_iva_acreditable",
                    value: nodefolioanticipo,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_fec_pag_factura",
                    value: fechapagfactura,
                    line: numLines
                });

                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_num_cheque_iva_acreditable",
                    value: numerodecheque,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_estado_cheque_iva_acreditable",
                    value: estadodecheque,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_tipo_pago_iva_acreditable",
                    value: tipopago,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_poliza_iva_acreditable",
                    value: poliza,
                    line: numLines
                });
                editRecord.setSublistValue({
                    sublistId: 'recmachcustrecord_iva_acreditable_parent',
                    fieldId: "custrecord_fecha_poliza_iva_acreditable",
                    value: fechadepoliza,
                    line: numLines
                });


                editRecord.save({
                    ignoreMandatoryFields: true
                });

                info.push({
                    transaction_type,
                    ref_No,
                    transaction_number,
                    inv_date,
                    inv_account,
                    inv_vendor_id,
                    inv_vendor_name,
                    inv_vendor_rfc,
                    inv_currency,
                    inv_status,
                    inv_uuid,
                    inv_vendor_pais,
                    inv_vendor_operation_type,
                    inv_vendor_type_ter,
                    base_tasa_16,
                    base_tasa_0,
                    base_exenta,
                    base_afectos_iva,
                    base_ieps_8,
                    base_ieps_26,
                    base_ieps_30,
                    base_ieps_53,
                    subtotalantesdeimp,
                    descantesdeimp,
                    imp_16,
                    imp_ieps_8,
                    imp_ieps_26,
                    imp_ieps_30,
                    imp_ieps_53,
                    iva_ret_hor,
                    iva_ret_arre,
                    iva_ret_fletes,
                    iva_ret_outsourcing,
                    total_iva_ret,
                    isr_ret_hon,
                    isr_ret_arren,
                    isr_ret_resico,
                    total_isr_ret,
                    impsobrenomret,
                    netofactura,
                    montoanticipo,
                    ivadeanticipo,
                    numdeopdelant,
                    fechapagoanticipo,
                    tipopagodeanticipo,
                    nodefolioanticipo,
                    fechapagfactura,
                    numerodecheque,
                    estadodecheque,
                    tipopago,
                    poliza,
                    fechadepoliza,
                });
            }
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
            // if (context.value == true) {
            //     log.debug("reduce", context.value);
            //     const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_bex_mr_isr_ivaacreditable' }));
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
            log.debug("summarize", "summarize");
            const parameters = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_bex_mr_isr_ivaacreditable' }));
            const tran_id = parameters.id;
            record.submitFields({
                type: 'customrecord_isr_iva_acreditable',
                id: tran_id,
                values: {
                    custrecord_estado_iva_acreditable: "Finalizado"
                }
            });
        }

        return { getInputData, map, reduce, summarize }

    });
