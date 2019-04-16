<?php

include("../conexion.php");
$con=conexion();
include("./estado.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 



if($_GET[accion]=='get'){

	$sql = mysqli_query($con, "SELECT * FROM departamento ORDER BY departamento ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_departamento'=>($v->id_departamento),
	'departamento'=>($v->departamento),
	'estado'=>($v->estado),
	'imagen'=>($v->imagen),
	'creacion'=>($v->creacion),
	'ubicacion'=>($v->ubicacion),

	'estado_final'=>(estado_departamento($v->id_departamento, $con)),
	
	);

	}

	echo json_encode($results);

}

if($_GET[accion]=='one'){

	$sql = mysqli_query($con, "SELECT * FROM departamento WHERE id_departamento='$_POST[id_departamento]' ORDER BY departamento ");

	$row = mysqli_fetch_assoc($sql);

	echo json_encode($row);

}



if($_GET[accion]=='nuevo'){


	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO departamento(departamento, estado, creacion, ubicacion) VALUES('$_POST[nombre_departamento]', '$_POST[estado]', '$fecha', '$_POST[ubicacion_dpto]')" );

	if($sql){
	  $lastid=mysqli_insert_id($con);
	  echo json_encode($lastid);
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='edit'){


	$sql = mysqli_query($con, "UPDATE departamento SET departamento='$_POST[nombre_departamento]', estado='$_POST[estado]', ubicacion='$_POST[ubicacion_dpto]' WHERE id_departamento='$_POST[id_departamento]' " );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='estado'){


	$sql = mysqli_query($con, "UPDATE departamento SET estado='$_POST[estado]' WHERE id_departamento='$_POST[id_departamento]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='estado_puestos'){


	$sql = mysqli_query($con, "UPDATE departamento_puesto SET estado='$_POST[estado]' WHERE id_puesto='$_POST[id_puesto]' AND id_departamento='$_POST[id_departamento]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='estado_asignacion'){


	$sql = mysqli_query($con, "UPDATE departamento_puesto SET estado='$_POST[estado]' WHERE id_cargo='$_POST[id_cargo]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='asignaciones'){


	$sql = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_departamento='$_POST[id_departamento]'");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_cargo'=>($v->id_cargo),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),
	'puesto'=>(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM puesto WHERE id_puesto=$v->id_puesto ")))),
	'departamento'=>(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM departamento WHERE id_departamento=$v->id_departamento ")))),
	'usuario'=>(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT id_usuario, username, email, nombre_completo, estado, id_configuracion, creacion FROM usuario WHERE id_usuario=$v->id_usuario ")))),

	'estado_final'=>(estado_asignacion($v->id_cargo, $con)),
	
	);

	}

	echo json_encode($results);



}



if($_GET[accion]=='puestos'){


	$sql = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_departamento='$_POST[id_departamento]' GROUP BY id_puesto");

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'puesto'=>(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM puesto WHERE id_puesto=$v->id_puesto ")))),

	'estado_final'=>(estado_puestoDpto($v->id_puesto, $_POST[id_departamento], $con)),
	
	);

	}

	echo json_encode($results);



}


mysqli_close($con);





?>
