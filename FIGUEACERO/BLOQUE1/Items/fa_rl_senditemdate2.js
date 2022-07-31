/**
 * @author Saul Navarro <saul.navarro@beexponential.com>
 * @modifico 
 * @fecha 3/02/2022
 * @Name fa_rl_senditemdate
 * @description Script de prueba para el desarrollo de la libreria de exportacion de records
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define(["N/log", "../libs/lib_rest_export", "N/search", " N/format"], function (
  log,
  jsexport,
  search,
  format
) {
  const entry_point = {
    get: null,
  };

  var response = {
    code: 200,
    message: "",
    result: [],
  };
  var itemfields = {};
  entry_point.get = function (request) {
    try {
      filters = [];
      var pagina = request.pagina || 1;
      var id = request.id;
      var fecha_desde;
      var fecha_hasta;
      if (request.desde && request.hasta) {
        fecha_desde = new Date(request.desde);
        fecha_hasta = new Date(request.hasta);
        var formattedDateString_desde = format.format({
          value: fecha_desde,
          type: format.Type.DATETIME,
        });
        log.debug("desde","-------------------------");
        log.debug("desde",fecha_desde);
        log.debug("hasta",fecha_hasta);
        log.debug("desde","-----------FEMCHAS--------------");

        var formattedDateString_hasta = format.format({
          value: fecha_hasta,
          type: format.Type.DATETIME,
        });


        log.debug("desde","-------------------------");
        log.debug("desde",formattedDateString_desde);
        log.debug("hasta",formattedDateString_hasta);
        log.debug("desde","-----------DESPUES DE PROCESAR--------------");

        formattedDateString_desde = formattedDateString_desde.replace(
          /(:\d{2}):\d{1,2}\b/,
          "$1"
        );
        formattedDateString_hasta = formattedDateString_hasta.replace(
          /(:\d{2}):\d{1,2}\b/,
          "$1"
        );
      }


      /* ["modified","within","1/2/2022 12:00 am","3/3/2022 11:00 pm"] */

      if (id) {
        filters.push(["internalidnumber", "equalto", id]);
      } else if (formattedDateString_desde && formattedDateString_hasta) {
        filters.push([
          "modified",
          "within",
          formattedDateString_desde,
          formattedDateString_hasta,
        ]);

      } else {
        response.message = "Campos opcionales: id || desde, hasta";
        return response;
      }
      var itemSearchObj = search.create({
        type: "item",
        filters: filters,
        columns: [
          (search_displayname = search.createColumn({
            name: "displayname",
            label: "displayname",
          })),
          (search_upccode = search.createColumn({
            name: "upccode",
            label: "upccode",
          })),
          (search_salesdescription = search.createColumn({
            name: "salesdescription",
            label: "salesdescription",
          })),
          (search_lote=search.createColumn({
              name: "islotitem", label: "Is Lot Numbered Item"})),
          (search_taxcode = search.createColumn({
            name: "custrecord_mx_ic_mr_code",
            join: "CUSTITEM_MX_TXN_ITEM_SAT_ITEM_CODE",
            label: "Code"
         })),
          (search_lastpurchaseprice = search.createColumn({
            name: "lastpurchaseprice",
            label: "lastpurchaseprice",
          })),
          (search_saleunit = search.createColumn({
            name: "saleunit",
            label: "saleunit",
          })),
          (search_isonline = search.createColumn({
            name: "isonline",
            label: "isonline",
          })),
          (search_custitemid_artnvo_fa01 = search.createColumn({
            name: "custitemid_artnvo_fa01",
            label: "custitemid_artnvo_fa01",
          })),
          (search_custitemid_artremt_fa02 = search.createColumn({
            name: "custitemid_artremt_fa02",
            label: "custitemid_artremt_fa02",
          })),
          (search_type = search.createColumn({ name: "type", label: "type" })),
          (search_custitem2 = search.createColumn({
            name: "custitem2",
            label: "custitem2",
          })),
          (search_cost = search.createColumn({ name: "cost", label: "cost" })),
          (search_custitem_ste_taxschedule = search.createColumn({
            name: "custitem_ste_taxschedule",
            label: "custitem_ste_taxschedule",
          })),
          (search_itemid = search.createColumn({
            name: "internalid",
            label: "itemid",
          })),
        ],
      });

      var resultado = [];
      var searchResultCount = itemSearchObj.runPaged().pageRanges;
      var pagedData = itemSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });
      for (var i = 0; i < pagedData.pageRanges.length; i++) {
        var currentPage = pagedData.fetch(i);
        currentPage.data.forEach(function (result) {

          var itemPriceSearchObj = search.create({
            type: "item",
            filters: [filters,"AND",
            ["internalid","anyof",result.getValue(search_itemid)]],
            columns: [
              search.createColumn({name: "internalId",sort: search.Sort.ASC,}),
              (search_pricelevel = search.createColumn({name: "pricelevel",join: "pricing",sort: search.Sort.DESC,label: "Price Level",})),
              (search_minimumquantity = search.createColumn({name: "minimumquantity",join: "pricing",sort: search.Sort.ASC,label: "Minimum Quantity",})),
              (search_unitprice = search.createColumn({name: "unitprice",join: "pricing",label: "Unit Price",})),
              (search_quantityrange = search.createColumn({name: "quantityrange",join: "pricing",label: "Quantity Range",})),
            ],
          });
          var id=null;
          var lista_item_price = [];
          var searchResultCount = itemPriceSearchObj.runPaged().pageRanges;
          var pagedData2 = itemPriceSearchObj.runPaged({
            "pa​g​e​S​i​z​e": 1000,
          });
          for (var j = 0; j < pagedData2.pageRanges.length; j++) {
            var currentPage2 = pagedData2.fetch(j);
            currentPage2.data.forEach(function (result2) {
              //resultado.push(result);
              lista_item_price.push({
                id: result2.getValue(search_itemid),
                pricelevel: result2.getText(search_pricelevel),
                unitprice: result2.getValue(search_unitprice),
                quantityrange: result2.getValue(search_quantityrange),
              });
            });
          }

          //resultado.push(result);
          response.result.push({
            item: result.getValue(search_itemid),
            displayname: result.getValue(search_displayname),
            type: result.getValue(search_type),
            islote:result.getValue(search_lote),
            upccode: result.getValue(search_upccode),
            salesdescription: result.getValue(search_salesdescription),
            custitem_mx_txn_item_sat_item_code: result.getValue(search_taxcode),
            lastpurchaseprice: result.getValue(search_lastpurchaseprice),
            saleunit: result.getValue(search_saleunit),
            isonline: result.getValue(search_isonline),
            custitemid_artnvo_fa01: result.getValue(search_custitemid_artnvo_fa01),
            custitemid_artremt_fa02: result.getValue(search_custitemid_artremt_fa02),
            custitem2: result.getValue(search_custitem2),
            cost: result.getValue(search_cost),
            custitem_ste_taxschedule: result.getValue(search_custitem_ste_taxschedule),
            price: lista_item_price
          });
        });
      }

      return response;
    } catch (error) {
      log.debug("error personalizado", error);
      response.message = error.message;
    }
    return response;
  };
  return entry_point;
});
