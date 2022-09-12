/**
 * @author Evelyn Sarmiento evelyn.sarmiento@beexponential.com.mx
 * @Name ac_rl_salesorder.js
 * @description Script de tipo restlet para realizar una sales order y actualizarla
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define(['N/search', 'N/record', 'N/https', 'N/format', 'N/file', 'N/encode'], function (search, record, https, format, file, encode) {
    const entry_point = {
        post: null,
        put: null
    };

    let clienteid = '';

    entry_point.post = function (context) {

        let request = JSON.parse(JSON.stringify(context));
        let item = request.detalleventa;
        let entityid = request.entity;
        let salesrep = request.salesrep;


        

         if(request.externalid_customer && request.externalid_customer != ''){
            let customerSearchObj = search.create({
                type: "customer",
                filters:
                [
                   ["externalidstring","is",request.externalid_customer]
                ],
                columns:
                [
                  search_id = search.createColumn({
                      name: "entityid",
                      sort: search.Sort.ASC,
                      label: "ID"
                   }),
                ]
             });
             var searchResultCount = customerSearchObj.runPaged().count;
             log.debug("customerSearchObj result count",searchResultCount);
             customerSearchObj.run().each(function(result){
                clienteid = result.getValue(search_id);
                return true;
             });
    
             log.debug('id en netsuite: ',clienteid);

             
         }else{
            throw('No se ha proporcionado el id del cliente');
         }

        // const record_sale = record.create({ //Se crea la sales order
        //     type: record.Type.INVOICE,
        //     isDynamic: true,
        //     defaultValues: {
        //         entity: entityid,

        //     }
        // }).setValue({
        //     fieldId: 'subsidiary',
        //     value: request.subsidiaria
        // }).setValue({
        //     fieldId: 'salesrep',
        //     value: salesrep
        // }).setValue({
        //     fieldId: "location",
        //     value: request.ubicacion,
        //     ignoreFieldChange: true,
        // }).setValue({
        //     fieldId: "approvalstatus",
        //     value: 2,
        //     ignoreFieldChange: true,
        // }).setValue({
        //     fieldId: "externalid",
        //     value: request.externalid,
        //     ignoreFieldChange: true,
        // }).setValue({
        //     fieldId: "memo",
        //     value: request.memo,
        //     ignoreFieldChange: true,
        // }).setValue({
        //     fieldId: "class",
        //     value: request.memo,
        //     ignoreFieldChange: true,
        // }).setValue({
        //     fieldId: "date",
        //     value: request.date,
        //     ignoreFieldChange: true,
        // })

        try {

            // item.forEach(function (value, index) {
            //     let internalid = value.articulo;
            //     let quantity = value.cantidad;
            //     let rate = value.preciounitario;
            //     let taxrate1 = value.iva;
            //     let descuentos = value.descuento;
            //     let taxe = (rate * quantity) * 0.16

            //     record_sale.selectNewLine({
            //         sublistId: 'item'
            //     }).setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'item',
            //         value: internalid
            //     }).setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'quantity',
            //         value: quantity
            //     }).setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'rate',
            //         value: rate
            //     }).commitLine({
            //         sublistId: "item"
            //     });


            // });


            // var id_invoice = record_sale.save({
            //     ignoreMandatoryFields: true
            // });


            // //pagarInvoice(id_invoice, pagos);


            // const response = {
            //     code: 200,
            //     message: "Transaccion de venta creada exitosamente",
            //     result: []
            // };

            // response.result.push({ id_invoice })
            return clienteid;

        } catch (err) {
            log.debug('err', err);
            let respo = {
                code: 400,
            }
            let error = err.message;
            if (error === "Please configure the inventory detail for this line.") {
                respo.messsage = 'No hay disponibilidad de este artículo por el momento';
            } else if (error === 'Multi-location Inventory Error (MLI_LOCATION_REQUIRED): this transaction or its items must have locations.') {
                respo.message = 'Favor de insertar una ubicación para esta transacción.'
            } else {

                respo = err;
            }



            return respo;
        }

    }

    function pagarInvoice(id_invoice, pagos) {

        let response = {}
        try {
            pagos.forEach(function (pago) {
                let objPayments = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: id_invoice,
                    toType: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });
                objPayments.setValue({ fieldId: 'paymentoption', value: pago.metodo_pago });
                objPayments.setValue({ fieldId: 'currency', value: pago.divisa });
                //objPayments.setValue({ fieldId: 'trandate', value: new Date(pago.trandate) });
                const sublistId = 'apply';
                let totalCount = objPayments.getLineCount({ sublistId: sublistId });
                for (let index = 0; index < totalCount; index++) {
                    objPayments.selectLine({ sublistId: sublistId, line: index });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'apply', value: true });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'amount', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'due', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'total', value: pago.monto });
                    objPayments.commitLine({ sublistId: sublistId });
                }
                var id = objPayments.save({ enableSourcing: true, ignoreMandatoryFields: true });
                // response.result.push({
                //     invoice: id_invoice,
                //     pago: id
                // });
            });
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
    }

    entry_point.put = function (context) {


    }
    return entry_point;
});