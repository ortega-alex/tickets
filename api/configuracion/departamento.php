<?php

include("../conexion.php");
$con=conexion();
include("./estado.php");
include('../helper.php');

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 

if ( $_GET[accion] == 'get' ) {
	$sql = mysqli_query($con, "SELECT * FROM departamento ORDER BY departamento ");
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

if ( $_GET[accion] == 'one' ) {
	$sql = mysqli_query($con, "SELECT * FROM departamento WHERE id_departamento={$_POST[id_departamento]} ORDER BY departamento ");
	$row = mysqli_fetch_assoc($sql);
	echo json_encode($row);
}

if ( $_GET[accion] == 'nuevo' ) {

	$strNombreDepartamento = isset($_POST['nombre_departamento']) ? trim($_POST['nombre_departamento']) : null;
	$strUbicacion = isset($_POST['ubicacion_dpto']) ? trim($_POST['ubicacion_dpto']) : null;
	$intEstado = intval($_POST['estado']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	
	if ( !empty($strNombreDepartamento) ) {
		$strQuery = " INSERT INTO departamento(departamento, estado, ubicacion) 
									VALUES('{$strNombreDepartamento}', {$intEstado}, '{$strUbicacion}')";
		if ( mysqli_query($con, $strQuery) ) {
			setHistorial($intUsuario , "Nuevo Departamento: {$strNombreDepartamento}" , $con);
			$lastid=mysqli_insert_id($con);
	 	 	echo json_encode($lastid);
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if ( $_GET[accion] == 'edit' ) {
	$strNombreDepartamento = isset($_POST['nombre_departamento']) ? trim($_POST['nombre_departamento']) : null;
	$strUbicacion = isset($_POST['ubicacion_dpto']) ? trim($_POST['ubicacion_dpto']) : null;
	$intEstado = intval($_POST['estado']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intIdDepartamento = isset($_POST['id_departamento']) ? intval($_POST['id_departamento']) : 0;

	if ( $intIdDepartamento > 0  && !empty($strNombreDepartamento) ) {
		$strQuery = " UPDATE departamento 
									SET departamento = '{$strNombreDepartamento}' , 
											estado = {$intEstado} , 
											ubicacion ='{$strUbicacion}' 
									WHERE id_departamento = {$intIdDepartamento}";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización Departamento: {$strNombreDepartamento} , Estado: {$strEstado}." , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
		echo json_encode("error");
	}
}

if($_GET[accion]=='estado'){

	$intIdDepartamento = isset($_POST['id_departamento']) ? intval($_POST['id_departamento']) : 0;
	$intEstado = intval($_POST['estado']);
	$strNombreDepartamento = isset($_POST['nombre_departamento']) ? trim($_POST['nombre_departamento']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdDepartamento > 0 ) {
		$strQuery = "UPDATE departamento 
								 SET estado={$intEstado} 
								 WHERE id_departamento={$intIdDepartamento}";
		if ( mysqli_query($con, $strQuery) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización de Departamento: {$strNombreDepartamento} , se dio de {$strEstado}" , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	}
}

if ( $_GET[accion] == 'estado_puestos' ) {
	$intIdDepartamento = isset($_POST['id_departamento']) ? intval($_POST['id_departamento']) : 0;
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$intEstado = intval($_POST['estado']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$strPuesto = isset($_POST['puesto']) ? trim($_POST['puesto']) : null;

	if ( $intIdDepartamento > 0 && $intIdPuesto > 0 ) {
		$strQuery = " UPDATE departamento_puesto 
									SET estado = {$intEstado} 
									WHERE id_puesto = {$intIdPuesto} 
									AND id_departamento = {$intIdDepartamento}";
		if (  mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización de puesto: {$strPuesto} se dio de {$strEstado}" , $con);
			echo json_encode("Ok");
		}else{
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if ( $_GET[accion] == 'estado_asignacion' ) {
	$intIdCargo = isset($_POST['id_cargo']) ? intval($_POST['id_cargo']) : 0;
	$intEstado = intval($_POST['estado']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdCargo > 0 ) {
		$strQuery = "UPDATE departamento_puesto 
								 SET estado={$intEstado} 
								 WHERE id_cargo={$intIdCargo}";
		if ( mysqli_query($con, $strQuery) ) {
			$strQuery = " SELECT b.departamento , c.username
										FROM departamento_puesto a 
										INNER JOIN departamento b ON a.id_departamento = b.id_departamento 
										INNER JOIN usuario c ON a.id_usuario = c.id_usuario
									  WHERE id_cargo = {$intIdCargo}";
			$qTpm = mysqli_query($con , $strQuery);
			$rTmp = mysqli_fetch_object($qTpm);
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización asignación, Departamento: {$rTmp->departamento} , Usuario: {$rTmp->username} , se dio de {$strEstado}." , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
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

	if ($_GET['accion'] == 'get_tickets') {
		$intIdDepartamento = isset($_GET['id_departamento']) ? intval($_GET['id_departamento']) : 0;
		if ( $intIdDepartamento > 0 ) {
			$strQuery = "	SELECT c.id_usuario_ticket , c.id_ticket , c.creacion,
								   IF (c.estado = 0 , 'Abierto' , 'Cerrado') AS estado ,
									d.nombre_completo ,
									e.nombre_ticket
							FROM departamento a
							INNER JOIN departamento_puesto b ON a.id_departamento = b.id_departamento
							INNER JOIN usuario_ticket c ON b.id_cargo = c.id_cargo
							INNER JOIN usuario d ON c.id_usuario = d.id_usuario
							INNER JOIN ticket e ON c.id_ticket = e.id_ticket
							WHERE a.id_departamento = {$intIdDepartamento}
							ORDER BY c.creacion DESC";
			$qTpm = mysqli_query($con , $strQuery);
			$res = array();
			while ( $rTmp = mysqli_fetch_object($qTpm) ) {
				$res[] = array(
					'id_usuario_ticket'=>($rTmp->id_usuario_ticket),	
					'id_ticket'=>($rTmp->id_ticket),	
					'estado'=>($rTmp->estado),	
					'id_ticket'=>($rTmp->id_ticket),	
					'nombre_completo'=>($rTmp->nombre_completo),	
					'nombre_ticket'=>($rTmp->nombre_ticket),			
				);
			}
			print(json_encode($res));
		}
	}

	mysqli_close($con);
?>