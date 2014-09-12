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
function checkConnection() {
    console.log("chequeamos conexion");
        var networkState = navigator.network.connection.type;
        if(networkState == "none") { 
          window.location.href="no_internet.html?location=index";
        }
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.NONE]     = 'No network connection';
}
// Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //
    function onDeviceReady() {
        checkConnection();
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    // onSuccess Geolocation
    function onSuccess(position) {
        get_autowikipedia_events(position.coords.latitude,position.coords.longitude);
    }

    function onError(error) {
        console.log("no tiene habilitado geolocation");
        window.location.href="no_geolocation.html?location=index";
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
            //mostramos el header
            $("header").show();
            console.log(data);
            //header rango fecha
            $("#rango_fecha").append('<img style="float: left;" class="anterior_se" src="images/prev2_w.png" height="40px" /><img style="float: right;" class="siguiente_se" src="images/next2_w.png" height="40px" /><div class="texto23"><span class="ultra-bold">' + monthNames[cortar_fecha(data[0].desde.substr(4, 2))] + '</span><span class="light">' + cortar_fecha(data[0].desde.substr(6, 2)) + '/<span class="ultra-bold">' + monthNames[cortar_fecha(data[0].hasta.substr(4, 2))] + '</span><span class="light">' + cortar_fecha(data[0].hasta.substr(6, 2))  + '</div>' );
            var eventos = $('#eventos').empty();
            for (var i=0; i<data.length; i++) {
                //buscamos la foto por categoria
               if (data[i].imagen == null) {
                    var foto = "images/foto1.jpg";
               }
               else {
                    var foto = data[i].imagen;
               }
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
                     var destacado = '<img style="float:right;height:30px;padding-top: 20px;padding-right: 20px;" src="images/star2.png" />' ;
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
                //tamaños fuentes
                var fuente_principal = ($( window ).width() * 20 ) / 480;
                var fuente_info = ($( window ).width() * 14 ) / 480;
                var fuente_distancia = ($( window ).width() * 13 ) / 480;
                //altura para cada div
                var altura_listado = ($( window ).width() * 600 ) / 1600;
                 eventos.append('<div class="listado" style="height:'+ altura_listado + 'px; background-image:url('+ foto + ');">'+ destacado + '<div class="principal" style="font-size:' + fuente_principal + 'px;"><span class="ultra-bold">' + categoria + ': </span><span class="light">' + data[i].carrera + '</span></div><div class="info" style="font-size:' + fuente_info + 'px;"><span class="ultra-bold">' + monthNames[cortar_fecha(mes)] + '</span><span class="light">' + cortar_fecha(dia) + nro_fecha + '</span></div><div class="distancia" style="font-size:' + fuente_distancia + 'px;"> ' + distancia + '</div><div class="distancia"> ' + circuito + '</div></div>');
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