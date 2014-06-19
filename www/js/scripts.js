document.addEventListener("deviceready", function()  {
	var maximo = 16;
	var number = 1 + Math.floor(Math.random() * maximo);
	var claserandom = "bg" + number;
	var claseprecarga = "bg" + (number + 1);
	$("#contenedor1").removeClass("bg1");
	$("#contenedor1").addClass(claserandom);
	$("#precargador").removeClass("bg2");
	$("#precargador").addClass(claseprecarga);

        $.post("http://autoplay.es/racing_calendar/m/eventos.php", { ready: "1"}, function( data ) {
			var eventos = $('#eventos').empty();
			for (var i=0; i<data.length; i++) {
					if (data[i].destacado == "1") {
						
						 eventos.append('<h2 class="roboto"><span class="bloque2">' + data[i].fecha + " - " + data[i].categoria + ": " + data[i].carrera + '</span></h2>');
					}
					else {
						eventos.append('<h2 class="roboto"><span class="bloque2">' + data[i].fecha + " - " + data[i].categoria + ": " + data[i].carrera + '</span></h2>');
					}
			}	 
		}, "json");
    }, false);

$( "#reload23" ).click(function(e) {
	e.preventDefault();
	var maximo2 = 16;
	$("#contenedor1").removeClass($('#contenedor1').attr('class'));
	$("#contenedor1").addClass($('#precargador').attr('class')); 
	var clase_nueva = $('#precargador').attr('class');
	$("#precargador").removeClass(clase_nueva);
	var numero_clase = clase_nueva.substring(2);
	numero_clase = Number(numero_clase);
	if (numero_clase == maximo2) {
		$("#precargador").addClass("bg1"); 
	}
	else {
		$("#precargador").addClass("bg" + (numero_clase + 1)); 	
	}
});
