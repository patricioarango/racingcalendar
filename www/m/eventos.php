<?
$dbHost = "awdb2013.db.8921995.hostedresource.com";
$dbUser = "awdb2013";
$dbPass = "GolPower!2011";
$dbName = "awdb2013";

$conn = new mysqli($dbHost, $dbUser, $dbPass , $dbName);
if ($conn->connect_errno) {
    echo "Falló la conexión a MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error;
}

$diadehoy = date("l");
if ($diadehoy === "Monday") {
	$diainicio = date("Ymd");
}
else {
	$diainicio = date("Ymd", strtotime("Last Monday"));
}
if ($diadehoy === "Sunday") {
	$diafin = date("Ymd", strtotime("Next Sunday"));
}
else {
$diafin = date("Ymd", strtotime("This Sunday"));
}


$sql="SELECT c.carrera, DATE_FORMAT(c.fecha,'%d/%m') AS fecha2, c.destacado, ca.shortname AS categoria
FROM carreras c
INNER JOIN subcategorias s ON c.id_subcategoria=s.id
INNER JOIN categorias ca ON s.id_categoria=ca.id
WHERE c.fecha BETWEEN ".$diainicio." AND ".$diafin." AND mostrar = 1
ORDER BY c.fecha";
$res = $conn->query($sql);
while ($row = $res->fetch_array()) {
	$result[] = array(
			'carrera' => $row["carrera"],
			'categoria' => $row["categoria"],
			'fecha' => $row["fecha2"],
			'destacado' => $row["destacado"],
		);
}
echo json_encode($result);

?>
