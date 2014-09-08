//meses
monthNames = [ "","ENE", "FEB", "MAR", "ABR", "MAY", "JUN  ",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC" ];
//funcion sacar 0 de las fechas
function cortar_fecha(fecha){
    if (fecha.substr(0, 1) === "0") {
        return fecha.substr(1, 1);
    }
    else {
        return fecha;
    }
}    
//arrays de fotos x categoria inicio
array_fotos = {
    cat_id_1    : ["foto1.jpg"], // F1
    cat_id_4    : ["foto1.jpg"], // MotoGP
    cat_id_5    : ["tc-1.png","tc-2.png","tc-3.png","tc-4.png","tc-6.png","tc-7.png","tc-8.png","tc-9.png","tc-14.png","tc-15.png"], // TC
    cat_id_6    : ["foto1.jpg"], // WEC
    cat_id_7    : ["foto1.jpg"], // WRC
    cat_id_8    : ["foto1.jpg"], // STC 2000
    cat_id_10   : ["foto1.jpg"], // Rally Arg.
    cat_id_11   : ["foto1.jpg"], // TC 2000
    cat_id_14   : ["foto1.jpg"], // TCP
    cat_id_15   : ["foto1.jpg"], // TCM
    cat_id_17   : ["foto1.jpg"], // TN
    cat_id_18   : ["foto1.jpg"], // TRV6
    cat_id_19   : ["foto1.jpg"], // DTM
    cat_id_27   : ["foto1.jpg"], // Dakar
    cat_id_28   : ["foto1.jpg"], // GP2
    cat_id_29   : ["foto1.jpg"], // WTCC
    cat_id_30   : ["foto1.jpg"], // SBK
    cat_id_32   : ["foto1.jpg"], // RallyCross
    cat_id_33   : ["foto1.jpg"] //  F-E
};
// Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //
    function onDeviceReady() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    // onSuccess Geolocation
    function onSuccess(position) {
        get_autowikipedia_events(position.coords.latitude,position.coords.longitude);
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
    }
    
    function get_autowikipedia_events(latitud,longitud) {
        var posicion = getUrlParameter('posicion');
        if (posicion  == null) {
            posicion = 0;
        }
        else {
            posicion = posicion;
        }
        console.log("posicion_actual" + posicion);
        var url = "http://autoplay.es/phonegap/racing_calendar_eventos.php?next_events=" + posicion;
        console.log
        $.post(url, { ready: "1"}, function(data) {
            //sacamos loading del body
            $("#loading").hide();
            console.log(data);
            //header rango fecha
            $("#rango_fecha").append('<img style="float: left;" class="anterior_se" src="images/prev2_w.png" height="40px" /><img style="float: right;" class="siguiente_se" src="images/next_w.png" height="40px" /><div class="texto23"><span class="ultra-bold">' + monthNames[cortar_fecha(data[0].desde.substr(4, 2))] + '</span><span class="light">' + cortar_fecha(data[0].desde.substr(6, 2)) + '/<span class="ultra-bold">' + monthNames[cortar_fecha(data[0].hasta.substr(4, 2))] + '</span><span class="light">' + cortar_fecha(data[0].hasta.substr(6, 2))  + '</div>' );
            var eventos = $('#eventos').empty();
            for (var i=0; i<data.length; i++) {
                //buscamos la foto random por categoria
                var maximo = array_fotos["cat_id_" + data[i].categoria_id].length;
                var numero_de_foto = Math.floor(Math.random() * maximo) + 1; //arrays de fotos x categoria fin
                var foto = array_fotos["cat_id_" + data[i].categoria_id][(+numero_de_foto - 1)];
                //buscamos la distancia siempre que el circuito no sea el "240"
                if (data[i].circuito_id != "240") {
                    var p1 = LatLon(Geo.parseDMS(latitud), Geo.parseDMS(longitud));
                    var p2 = LatLon(Geo.parseDMS(data[i].latitud), Geo.parseDMS(data[i].longitud));
                    var distancia = '<img src="images/location.png" height="15px">' + Math.ceil(p1.distanceTo(p2)) + " kms ";
                    var circuito = '<img src="images/circuit-icon.png" height="15px">' + data[i].circuito;
                }
                else {
                    var distancia = "";
                    var circuito = "";
                }
                //destacados
                if (data[i].destacado == "1") {
                     var destacado = '<img style="float:right;height:30px;padding-top: 20px;padding-right: 20px;" src="images/star.png" />' ;
                }
                else {
                     var destacado = "";     
                }
                //con nro fecha
                if (data[i].nro_fecha > 0 ){
                    var nro_fecha = " Round" + data[i].nro_fecha;
                }
                else {
                    var nro_fecha = "";
                }
                //nombre corto para categoria si el nombre es largo
                if (data[i].categoria.length > 19) {
                    var categoria = data[i].categoria_short;
                }
                else {
                    var categoria = data[i].categoria;
                }
                var dia = data[i].fecha.substr(0,2);
                var mes = data[i].fecha.substr(3,2);
                //altura para cada div
                var altura_listado = ($( window ).width() * 600 ) / 1600;
                 eventos.append('<div class="listado" style="height:'+ altura_listado + 'px; background-image:url(images/'+ foto + ');">'+ destacado + '<div class="principal"><span class="ultra-bold">' + categoria + ': </span><span class="light">' + data[i].carrera + '</span></div><div class="info"><span class="ultra-bold">' + monthNames[cortar_fecha(mes)] + '</span><span class="light">' + cortar_fecha(dia) + nro_fecha + foto + '</span></div><div class="distancia"> ' + distancia + '</div><div class="distancia"> ' + circuito + '</div></div>');
            } //cierra for
        }, "json");
       
    }
//funcion para sacar los datos de la url
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}  
$("header").on('click',".anterior_se",function(e) {
    e.preventDefault();
   var posicion = getUrlParameter('posicion');
   if (posicion == null) {
        posicion = "-1";
   }
   else {
        posicion = +posicion - 1;  
   }
   window.location.href='index.html?posicion=' + posicion;
});
$("header").on('click',".siguiente_se",function(e) {
    e.preventDefault();
   var posicion = getUrlParameter('posicion');
    if (posicion == null)  {
        posicion = 1;
   }
   else {
        posicion = +posicion + 1; 
   }
   window.location.href='index.html?posicion=' + posicion;
});