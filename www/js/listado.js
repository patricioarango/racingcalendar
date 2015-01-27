//meses
monthNames = [ "","Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Deciembre" ];
//array colores
colores = ["","#1abc9c","#3498db","#34495e","#f1c40f"];    
    // Wait for Cordova to load
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    function onDeviceReady() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        //obtenemos color random para layer
        var rnd_color = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
        $("#navegador").css("background-color",colores[rnd_color]);
        $("footer").css("background-color",colores[rnd_color]);
        color = colores[rnd_color];
    }
    
    // onSuccess Geolocation
    function onSuccess(position) {
        get_autowikipedia_events(position.coords.latitude,position.coords.longitude);
    }

    function onError(error) {
        console.log("no tiene habilitado geolocation");
        window.location.href="no_geolocation.html?location=index";
    }
    var hoy = new Date();
    var siguiente_carrera = 0;
    function get_autowikipedia_events(latitud,longitud) {
        var tipo_icono;
        var distancia;
        var circuito;
        var id_categoria = getUrlParameter('id_categoria');

        if (id_categoria  == null) {
            id_categoria = 0;
        }
        else {
            id_categoria = id_categoria;
        }

        var url = "http://autowikipedia.es/phonegap/racing_calendar_eventos_por_categoria.php?id_categoria=" + id_categoria;
            $.post(url, { ready: "1"}, function(data) {
            //sacamos loading del body
            $(".loading_contenedor").hide();
            //logueamos la data
            console.log(data);
            var eventos = $('#eventos').empty();
            var header = $("#rango_fechas").empty();
            //nombre corto para categoria si el nombre es largo
                if (data[0].categoria.length > 19) {
                    var categoria = data[0].categoria_short;
                }
                else {
                    var categoria = data[0].categoria;
                }
            //contenido header
            header.append("category/" + categoria);
            for (var i=0; i<data.length; i++) {
                //buscamos la distancia siempre que el circuito no sea el "240"
                if (data[i].circuito_id != "240") {
                    var p1 = LatLon(Geo.parseDMS(latitud), Geo.parseDMS(longitud));
                    var p2 = LatLon(Geo.parseDMS(data[i].latitud), Geo.parseDMS(data[i].longitud));
                    distancia = Math.ceil(p1.distanceTo(p2));

                    circuito = data[i].circuito + ". ";
                }
                else {
                    distancia = "";
                    circuito = "-";
                }
                //destacados
                if (data[i].destacado == "1") {
                    destacado = '<i class="small mdi-action-stars right"></i>';
                }
                else {
                     destacado = '';
                }
                //comparamos las fechas
                var fecha_carrera = new Date(data[i].fecha);

                if (hoy.getTime() > fecha_carrera.getTime()) {
                   tipo_icono = '<i class="fa fa-check-circle tipo_icono"></i>';
                    ++siguiente_carrera;

                } else if (siguiente_carrera == 1){ 
                    tipo_icono = '<i class="fa fa-dot-circle-o tipo_icono"></i>';
                    --siguiente_carrera;

                } else {
                    if (i == 0) { //si empieza el torneo marcamos la 1era carrera
                        tipo_icono = '<i class="fa fa-dot-circle-o tipo_icono"></i>';
                    } else {
                        tipo_icono = '<i class="fa fa-circle-o tipo_icono"></i>';
                    }
                    --siguiente_carrera;
                }

                //contenido body
        eventos.append('<div class="row valign-wrapper borde">'+
        '<div class="col s2 icono" style="color:'+color+';">' +
            tipo_icono +
        '</div>' +
        '<div class="col s9">' +
            '<div class="lista_heading">'+data[i].carrera+'</div>' +
            '<div class="lista_secundario">'+monthNames[data[i].mes] +', '+ data[i].dia +'. Round '+data[i].nro_fecha+'.</div>' +
            '<div class="lista_secundario">'+circuito+' '+distancia+' kms.</div>' +
        '</div>' +
        '<div class="col s1" style="color:'+color+';">' +
            destacado +
        '</div>' +
    '</div>');
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
$("#navegador").click(function(e) {
    e.preventDefault();
   window.location.href='index.html';
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
