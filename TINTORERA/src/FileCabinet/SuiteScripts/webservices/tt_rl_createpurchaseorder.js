/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {


        const response = {
            code:null,
            message:null,
            result:[]
        } 
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {
            return "get"
        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {
            
        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (request) => {

    let otherrefnum = request.preveedronum
    let entity = request.proveedor
    let trandate =formatingdate(request.fechatransaccion)
    let memo = request.comentario
    let clase = request.clase
    let location = request.ubicacion
    let department = request.departmento
    let currency = request.moneda
    let exchangerate = request.cambiomoneda
    let purchsseObj=record.create({
        type: record.Type.PURCHASE_ORDER,
        isDynamic: true
    })
    try {
    log.debug("Entramos sin prblemas")
    purchsseObj.setValue({
        fieldId:"otherrefnum",
        value: otherrefnum
    })
    log.debug("Entramos sin prblemas 71")
    purchsseObj.setValue({
        fieldId:"entity",
        value: entity
    })
    log.debug("Entramos sin prblemas 76")
    purchsseObj.setValue({
        fieldId:"trandate",
        value: trandate
    })
    log.debug("Entramos sin prblemas 81")
    purchsseObj.setValue({
        fieldId:"memo",
        value: memo
    })
    purchsseObj.setValue({
        fieldId:"clase",
        value: clase
    })
    purchsseObj.setValue({
        fieldId:"location",
        value: location
    })
    purchsseObj.setValue({
        fieldId:"department",
        value: department
    })
    purchsseObj.setValue({
        fieldId:"currency",
        value: currency
    })
    purchsseObj.setValue({
        fieldId:"exchangerate",
        value: exchangerate
    })
    log.debug("Llegamos sin prblemas 103")
} catch (error) {
    response.code=400
                response.message="Error al cargar información de cabecera: "+error.message
}
                
            let items = request.articulos
            items.forEach(value => {
                try {
                let item = value.articulo;
                let amount = value.precio;
                let quantity = value.cantidad;
                let units = value.medida;

                purchsseObj.selectNewLine({
                    sublistId: "item"
                })
                purchsseObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value:item
                });
                log.debug("Llegamos sin prblemas 119")
                purchsseObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount',
                    value:amount
                });
                purchsseObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value:quantity
                });
                purchsseObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'units',
                    value:units
                });
                log.debug("Llegamos sin prblemas")

                // Save the line in the record's sublist
                purchsseObj.commitLine({
                    sublistId: 'item',
                });
            } catch (error) {
                response.code=400
                response.message="Error al cargar información de items: "+error.message
            }
            });
            var id_cash_sale = purchsseObj.save({
                ignoreMandatoryFields: true
            });
            response.code=200
            response.message="PO creada con exito "
            response.result.push({cashsaleid:id_cash_sale})

            return response
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

//function area
function formatingdate(trandate) {
    let formating=trandate.split("/");
    let  newdate1 = formating[1]+"/"+formating[0]+"/"+formating[2]
    let  newdate=new Date(newdate1)
    return newdate
}



        return {get, put, post, delete: doDelete}

    });
