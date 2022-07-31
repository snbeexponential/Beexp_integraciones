/**
 * @author Evelyn Sarmiento evelyn.sarmiento@beexponential.com.mx
 * @Name ac_rl_salesorder.js
 * @description Script de tipo restlet para realizar una sales order y actualizarla
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define(['N/search', 'N/record', 'N/https', 'N/format'], function (search, record, https, format) {
    const entry_point = {
        post: null,
        put: null
    };

    entry_point.post= function (context) {
        let request = JSON.parse(JSON.stringify(context));
        let item = request.item;
        let subtotal = request.subtotal;
        let entityid = request.entity;

        const record_sale = record.create({ //Se crea la sales order
            type: record.Type.SALES_ORDER,
            isDynamic: true,
            defaultValues: {
                entity: entityid,
            }
        }).setValue({
            fieldId: 'subsidiary',
            value: 1
        })

        item.forEach(function (index) {
            let internalid = index.id;
            let quantity = index.quantity;
            let rate = index.rate;
            let taxrate1 = index.tax;

            record_sale.selectNewLine({
                sublistId: 'item'
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: internalid
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: quantity
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate1',
                value: taxrate1
            })
                .setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rate
                }).commitLine({
                    sublistId: "item"
                });

        });

        log.debug('record id', record_sale.id);
        record_sale.save({
            ignoreMandatoryFields: true
        });

    }

    entry_point.put = function (context) {
        // Submit a new value for a sales order's memo field.
        let request = JSON.parse(JSON.stringify(context));
        let item = request.item;


        var objRecord = record.load({ //Carga la sales order del id que le pasas por JSON
            type: record.Type.SALES_ORDER,
            id: request.idsalesorder,
            isDynamic: true,
        });
        var item_count = objRecord.getLineCount({ sublistId: 'item' });


        log.debug('TI', item[0].id);

        for (let i = 0; i < item_count; i++) {

            var seline = objRecord.selectLine({
                sublistId: 'item',
                line: i
            });
            var internalid = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });
            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: item[i].id,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: item[i].quantity,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: item[i].rate,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate1',
                value: item[i].tax,
                ignoreFieldChange: true
            }).commitLine({ sublistId: 'item', ignoreRecalc: true });


        }

        objRecord.save({
            ignoreMandatoryFields: true
        });

    }


    return entry_point;
});