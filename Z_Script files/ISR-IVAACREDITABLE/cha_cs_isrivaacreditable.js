/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/https', 'N/url', 'N/ui/dialog'],
    /**
     * @param{record} record
     */
    function (record, https, url, dialog) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            if (scriptContext.fieldId == 'custrecord_fec_final_iva_acreditable') {
                const cRecord = scriptContext.currentRecord;
                const initial_date = cRecord.getValue('custrecord_fec_inicial_iva_acreditable');
                const finish_date = cRecord.getValue('custrecord_fec_final_iva_acreditable');

                if (finish_date < initial_date) {
                    dialog.alert({ title: 'Error!', message: 'La fecha final no puede ser menor a la fecha inicial!' });
                    cRecord.setValue({ fieldId: 'custrecord_fec_inicial_iva_acreditable', value: '' });
                    cRecord.setValue({ fieldId: 'custrecord_fec_final_iva_acreditable', value: '' });
                    return false;
                }
            }
            if (scriptContext.fieldId == 'custrecord_fec_inicial_iva_acreditable' || scriptContext.fieldId == 'custrecord_fec_final_iva_acreditable') {
                const cRecord2 = scriptContext.currentRecord;
                const date1 = cRecord2.getText('custrecord_fec_inicial_iva_acreditable');
                const date2 = cRecord2.getText('custrecord_fec_final_iva_acreditable');
                const initial_date2 = date1.toString().split('/');
                const finish_date2 = date2.toString().split('/');
                const fFecha1 = Date.UTC(initial_date2[2], initial_date2[1] - 1, initial_date2[0]);
                const fFecha2 = Date.UTC(finish_date2[2], finish_date2[1] - 1, finish_date2[0]);
                const dif = fFecha2 - fFecha1;
                const dias = Math.floor(dif / (1000 * 60 * 60 * 24));

                log.debug('date1', date1);
                log.debug('date2', date2);
                log.debug('initial_date2', initial_date2);
                log.debug('finish_date2', finish_date2);
                log.debug('fFecha1', fFecha1);
                log.debug('fFecha2', fFecha2);
                log.debug('dif', dif);

                log.debug('date_sum', dias);

                if (dias > 30) {
                    dialog.alert({ title: 'Error!', message: 'El numero de dias no puede ser mayor a 31' });
                    cRecord2.setValue({ fieldId: 'custrecord_fec_inicial_iva_acreditable', value: '' });
                    cRecord2.setValue({ fieldId: 'custrecord_fec_final_iva_acreditable', value: '' });
                    return false;
                }
            }
            return true;
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        function print(csvData) {
            //var params=csvData;
            log.debug('Lo que le llega a 2', csvData);
            var params = { data: csvData };
            var suiteletURL = url.resolveScript({
                scriptId: "customscript_cha_sl_csv_generateimpuesto",
                deploymentId: "customdeploy_cha_sl_csv_generateimpuesto",
                /* scriptId: "customscriptcha_cs_csv_generate_impuesto",
                deploymentId: "customdeploycha_cs_csv_generate_impuesto", */
            });
            log.debug('urlSuitelet', params)
            var respon = https.post({
                url: suiteletURL,
                body: params
            });
            var datosnuevos = JSON.parse(respon.body);
            var stringulr = JSON.stringify(datosnuevos.url);
            var correcturl = stringulr.slice(1, -1);
            window.open(correcturl);
        }

        function printCSV(csvData) {
            log.debug('hola', 'hola prueba');
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
            print: print,
            printCSV: printCSV
        };

    });
