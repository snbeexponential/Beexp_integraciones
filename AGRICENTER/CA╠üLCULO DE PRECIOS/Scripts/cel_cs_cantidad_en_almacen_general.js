/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/ui/dialog'],

function(search, record, dialog) {
    
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
    	alert("test");
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
		try {
		
			
		}
        catch(error){
			log.error('main error', error);
		}				
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
		return true;		
    }
	
	  function obtenerDisponibleUbicacion(ubicacionOv,itemId) {
		var cantLocation = 0;
		
		var itemSearchObj = search.create({
			type: "item",
			filters:
			[
				["type","anyof","InvtPart","Assembly"], 
				"AND", 
				["locationquantityonhand","greaterthan","0"], 
				"AND", 
				["inventorylocation","anyof",ubicacionOv], 
				"AND", 
				["internalidnumber","equalto",itemId]
			],
			columns:
			[
				search.createColumn({
				 name: "itemid",
				 sort: search.Sort.ASC,
				 label: "Nombre"
				}),
				search.createColumn({name: "locationquantityavailable", label: "Ubicación disponible"}),
				search.createColumn({name: "inventorylocation", label: "Ubicación del inventario"})
			]
		});


		var srchResults = itemSearchObj.run().getRange({
			start : 0,
			end   : 9
		});

    log.debug("srchResults",srchResults)
		if(srchResults.length > 0){
			cantLocation	= srchResults[0].getValue({name: 'locationquantityavailable'});    				
		} 
		return cantLocation;
		
    }
	
	
	function postSourcing(scriptContext) {
		
		try {
		
			var currentRecord = scriptContext.currentRecord;
			var sublistName = scriptContext.sublistId;
			var sublistFieldName = scriptContext.fieldId;
			var ubicacionOv = currentRecord.getValue('location');
          console.log("ubicacionOv",ubicacionOv)
			debugger;
		
			if (sublistName == 'item' && sublistFieldName == 'item')
			{
				
				var itemId = parseInt(currentRecord.getCurrentSublistValue(scriptContext.sublistId, 'item'));

				var cantLocation = obtenerDisponibleUbicacion(ubicacionOv,itemId);
				var saleType = parseInt(currentRecord.getValue('custbody_crt_tipodeventa_'));
        console.log("saleType",saleType)
        debugger
        if(saleType) {
          console.log("saleType",saleType)
          if(saleType == 1) {
            console.log("Mayoreo")
            currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: 12});
          } else if(saleType == 3) { //Online
            currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: 7});
          } else if(saleType == 4) { //Intercompañia
            currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: ''}); //Tectus
          } else if(saleType == 5) { //Franquicias
            currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: 9});
          } else {
            currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: ''});
          }
        } else {
          currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: ''});
          dialog.alert({
            title: 'Tipo de venta no definido',
            message: 'No se ha definido un tipo de venta, se enviará tectus por default '
          });
          return false;
        }

        if(cantLocation != 0 || cantLocation != '') 
          currentRecord.setCurrentSublistValue('item', 'custcol_drt_disponible_ubic',cantLocation);
        else 
          currentRecord.setCurrentSublistValue('item', 'custcol_drt_disponible_ubic',0);
				
			}
		}
        catch(error){
			log.error('main error', error);
		}
		
	}


  //Validación para no permitir agregar líneas a la orden de venta sin existencia
  function validateField(scriptContext) {
    try {
		
			var currentRecord = scriptContext.currentRecord;
			var sublistName = scriptContext.sublistId;
			var sublistFieldName = scriptContext.fieldId;
			var ubicacionOv = currentRecord.getValue('location');
      console.log("ubicacionOv",ubicacionOv)
      var band = true;
		
		
			if (sublistName == 'item' && sublistFieldName == 'item')
			{
				
				var itemId = parseInt(currentRecord.getCurrentSublistValue(scriptContext.sublistId, 'item'));
        var itemName = currentRecord.getCurrentSublistText(scriptContext.sublistId, 'item');
        
        if(itemName.includes("ENVIO") != true && itemName.includes("envio") != true) {
          var cantLocation = obtenerDisponibleUbicacion(ubicacionOv,itemId);
          parseInt(cantLocation);

          if(cantLocation == 0 || cantLocation == '') {
            dialog.alert({
              title: 'Articulo no disponible para venta',
              message: 'Este articulo no tiene existencia en el almacén '
            });
            band = false;
          }
        }
        
        return band;
			}

      else if (sublistName == 'item' && sublistFieldName == 'quantity')
			{
				
				var itemId = parseInt(currentRecord.getCurrentSublistValue(scriptContext.sublistId, 'item'));
				var cantLocation = obtenerDisponibleUbicacion(ubicacionOv,itemId);
        var quantity = parseInt(currentRecord.getCurrentSublistValue(scriptContext.sublistId, 'quantity'));
        parseInt(cantLocation);
        var resLocation = cantLocation-quantity;
       

        if(resLocation <= 0 || resLocation == '') {
          dialog.alert({
            title: 'Articulo no disponible para venta',
            message: 'La cantidad disponible es de '+cantLocation+' artículos'
          });
          currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: ''});
        }
			}

      else {
        return true;
      }
		}catch(error){
			log.error('main error', error);
		}
  }

    return {
        pageInit: pageInit,
        //fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        validateField: validateField,
        //validateLine: validateLine
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        //saveRecord: saveRecord
    };
    
});
