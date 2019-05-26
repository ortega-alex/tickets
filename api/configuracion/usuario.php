<?php

include("../conexion.php");
$con=conexion();
include("./estado_usuario.php");
include("./estado_tickets.php");

include('../helper.php');

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 

if ( $_GET[accion]=='get' ) {
	$strQuery = "SELECT id_usuario , username , email , nombre_completo 
				 FROM usuario 
				 ORDER BY nombre_completo";
	$qTmp = mysqli_query($con, $strQuery);
	$results=array();
	while($rTpm = mysqli_fetch_object($qTmp)){
		$results[] = array(
			'id_usuario'=>($rTpm->id_usuario),
			'username'=>($rTpm->username),
			'email'=>($rTpm->email),
			'nombre_completo'=>($rTpm->nombre_completo)
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion]=='one' ) {
	$sql = mysqli_query($con, "SELECT * FROM usuario WHERE id_usuario={$_POST['id_usuario']}");
	$row = mysqli_fetch_assoc($sql);
	echo json_encode($row);
}

if($_GET[accion]=='get_usuarios_all') {
	$intRol = isset($_GET['rol']) ? intval($_GET['rol']) : 0;
	$intIdUsuario = isset($_GET['_usuario']) ? intval($_GET['_usuario']) : 0;

	if ( $intRol == 1 ) {
		$_AND = "AND us.id_usuario = {$intIdUsuario}";
	}

	if ( $intRol == 2 ) {
		$_AND = "AND us.id_rol NOT IN(3)
				 AND dp.id_departamento IN (SELECT b.id_departamento 
										   FROM usuario a
										   INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
										   WHERE a.id_usuario = {$intIdUsuario}
										   GROUP BY b.id_departamento)";
	}

	$strQuery = "SELECT us.id_usuario, us.username, us.email, us.nombre_completo, us.estado, us.id_configuracion, 
						us.creacion, us.soporte, d.departamento, p.puesto, count(*) as 'asignaciones'  
				 FROM usuario us, departamento d, departamento_puesto dp,  puesto p 
				 WHERE d.id_departamento = dp.id_departamento 
				 AND p.id_puesto = dp.id_puesto 
				 AND dp.id_usuario = us.id_usuario 
				 {$_AND}
				 GROUP BY us.id_usuario 
				 ORDER BY us.nombre_completo";	
	//con asignaciones
	$sql = mysqli_query($con, $strQuery );

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_usuario'=>($v->id_usuario),
			'username'=>($v->username),
			'email'=>($v->email),
			'nombre_completo'=>($v->nombre_completo),
			'estado'=>($v->estado),
			'id_configuracion'=>($v->id_configuracion),
			'creacion'=>($v->creacion),
			'soporte'=>($v->soporte),
			'departamento'=>($v->departamento),
			'puesto'=>($v->puesto),
			'asignaciones'=>($v->asignaciones),
			'estado_final'=>(estado_usuario($v->id_usuario, $con)),		
		);
	}
	//sin asignaciones
	$strQuery = "SELECT us.id_usuario, us.username, us.email, us.nombre_completo, us.estado,
						us.id_configuracion, us.creacion, us.soporte 
				 FROM usuario us 
				 WHERE us.id_usuario NOT IN( SELECT us.id_usuario  
				 							 FROM usuario us, departamento d, departamento_puesto dp,  puesto p 
											 WHERE d.id_departamento=dp.id_departamento 
											 AND p.id_puesto=dp.id_puesto 
											 AND dp.id_usuario=us.id_usuario 
											 GROUP BY us.id_usuario 
											 ORDER BY us.nombre_completo ) 
				 GROUP BY us.id_usuario ORDER BY us.nombre_completo";
	$sql2 = mysqli_query($con, $strQuery);
	while($v = mysqli_fetch_object($sql2)){
		$results[] = array(
			'id_usuario'=>($v->id_usuario),
			'username'=>($v->username),
			'email'=>($v->email),
			'nombre_completo'=>($v->nombre_completo),
			'estado'=>($v->estado),
			'id_configuracion'=>($v->id_configuracion),
			'creacion'=>($v->creacion),
			'soporte'=>($v->soporte),
			'departamento'=>('Sin asignar'),
			'puesto'=>('Sin asignar'),
			'asignaciones'=>('0'),
			'estado_final'=>(estado_usuario($v->id_usuario, $con)),			
		);
	}
	echo json_encode($results);
}

if($_GET[accion]=='edit'){
	$strQuery = "UPDATE usuario 
				 SET username='{$_POST[username]}', 
				 	 password='{$_POST[pass]}', 
					 email='{$_POST[email]}', 
					 nombre_completo='{$_POST[nombre_completo]}', 
					 estado={$_POST[activo]} ,
					 id_rol={$_POST['id_rol']} 
				 WHERE id_usuario='$_POST[id_usuario]'";
	$sql = mysqli_query($con, $strQuery );
	if($sql){
		setHistorial($_POST['usuario'] , "Modificacion de usuario {$_POST[nombre_completo]}" , $con);
	  	echo json_encode("Ok");
	}else{
	  	echo json_encode("error");
	}
}

if($_GET[accion]=='cambiar_estado'){
	$strQuery = "UPDATE usuario 
				 SET estado={$_POST[estado]} 
				 WHERE id_usuario={$_POST[id_usuario]}" ;

	$sql = mysqli_query($con,$strQuery);	

	if($sql){
		$strStado = $_POST['estado'] == 0 ? 'Baja' : 'Alta';
		$strQuery = "SELECT username
					 FROM usuario
					 WHERE id_usuario = {$_POST[id_usuario]} ";
		$qTmp = mysqli_query($con,$strQuery);
		$rTmp = mysqli_fetch_array($qTmp);				
		setHistorial($_POST['_usuario'] , "Se dio de {$strStado} el usuario :  {$rTmp['username']}" , $con);
		echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}
}

if ( $_GET[accion]=='cambiar_estado_soporte' ) {
	$strQuery = "UPDATE usuario 
				 SET soporte={$_POST[estado]} 
				 WHERE id_usuario={$_POST[id_usuario]}";
	$sql = mysqli_query($con, $strQuery );
	if($sql){
		$strStado = $_POST[estado] == 0 ? 'Baja' : 'Alta';
		setHistorial($_POST['_usuario'] , "Se dio de {$strStado} al usuario {$_POST['username']} como soporte." , $con);
	  	echo json_encode("Ok");
	}else{
	  	echo json_encode("error");
	}
}

if($_GET[accion]=='nuevo'){
	$sql = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM usuario WHERE username='$_POST[username]'");
	$row = mysqli_fetch_assoc($sql);
	$cols_respuesta = $row['NUMBER_OF_ROWS'];

	if ( $cols_respuesta==0 ) {
		$strQuery = "INSERT INTO usuario (username, password, email, nombre_completo, estado, id_rol) 
					 VALUES('{$_POST[username]}', '{$_POST[pass]}', '{$_POST[email]}', '{$_POST[nombre_completo]}', {$_POST[activo]} , {$_POST['id_rol']})";
		$sql = mysqli_query($con, $strQuery );
		if ( $sql ) {
			setHistorial($_POST['usuario'] , "Nuevo usuario {$_POST[nombre_completo]}" , $con);
		  	$lastid=mysqli_insert_id($con);
		  	echo json_encode($lastid);
		} else {
		  	echo json_encode("error");
		}
	} else {
		echo json_encode("existe");
	}
}


if ( $_GET[accion] == 'asignar' ) {

	$intIdUsuario = isset($_POST['usuario']) ? intval($_POST['usuario']) : 0;
	$intIdDepartamento = isset($_POST['departamento']) ? intval($_POST['departamento']) : 0;
	$intEdit = isset($_POST['edit']) ? intval($_POST['edit']) : 0;
	$intIdPuesto = isset($_POST['puesto']) ? intval($_POST['puesto']) : 0;
	$intIdCargo = isset($_POST['id_cargo']) ? intval($_POST['id_cargo']) : 0;

	$strQuery = "SELECT id_cargo
				 FROM departamento_puesto 
				 WHERE id_departamento = {$intIdDepartamento} 
				 AND id_usuario = {$intIdUsuario}";
				
	$qTmp = mysqli_query($con, $strQuery);
	if ( mysqli_num_rows($qTmp) == 0 ||  $intEdit == 1 ) {

		$strQuery = "SELECT id_perfil_permisos FROM puesto WHERE id_puesto = {$intIdPuesto}";
		$qTmp = mysqli_query($con , $strQuery);
		$idPerfilPermisos = mysqli_fetch_assoc($qTmp);
		
		
		if ( $intEdit == 0 ) {
			$strQuery = "INSERT INTO departamento_puesto (id_puesto, id_departamento, id_usuario, estado) 
						 VALUES({$intIdPuesto}, {$intIdDepartamento}, {$intIdUsuario}, {$_POST[activo]})";
		} else {
			
			$strQuery = "DELETE FROM usuario_permisos 
						 WHERE id_perfil_permisos = {$idPerfilPermisos['id_perfil_permisos']}
						 AND id_usuario = {$intIdUsuario}";
			mysqli_query($con , $strQuery);
			
			$strQuery = "DELETE FROM tickets_cargo WHERE id_cargo = {$intIdCargo}";
			mysqli_query($con , $strQuery);
			$strQuery = "DELETE FROM tickets_soporte WHERE id_cargo = {$intIdCargo}";
			mysqli_query($con , $strQuery);
			$strQuery = "DELETE FROM tickets_soporte_global WHERE id_usuario = {$intIdUsuario}";
			mysqli_query($con , $strQuery);
			$strQuery = "UPDATE departamento_puesto 
						 SET id_puesto = {$intIdPuesto} ,
							 id_departamento = {$intIdDepartamento} ,
							 id_usuario = {$intIdUsuario} ,
							 estado = {$_POST[activo]}
						 WHERE id_cargo = {$intIdCargo}";
		}

		if (  mysqli_query($con, $strQuery) ) {		  
			$intIdCargo = ($intEdit == 0) ? $lastid=mysqli_insert_id($con) : $intIdCargo;

			if ( intval($_POST[nuevo_actualizar_permisos]) == 1 ) {
				//perfil permisos
				$strQuery = "SELECT id_accion FROM perfil_permiso WHERE id_perfil_permisos = {$idPerfilPermisos['id_perfil_permisos']}";
				$qTmp = mysqli_query($con, $strQuery);

				while ( $rTmp = mysqli_fetch_object($qTmp) ) {
					$strQuery = "INSERT INTO usuario_permisos ( id_accion , id_usuario , id_perfil_permisos ) 
								 VALUES( {$rTmp->id_accion} , {$intIdUsuario} ,  {$idPerfilPermisos['id_perfil_permisos']} ) ";
					mysqli_query($con , $strQuery);
				}

				/////perfil tickets puesto
				$strQuery = "SELECT id_ticket
							 FROM perfil_tickets 
							 WHERE id_puesto = {$intIdPuesto} ";
				$qTmp = mysqli_query($con, $strQuery);
				while ( $rTmp = mysqli_fetch_object($qTmp) ) {
					$strQuery = "INSERT INTO tickets_cargo ( id_cargo, id_ticket, estado) 
								 VALUES( {$intIdCargo} , {$rTmp->id_ticket } , 1) ";
					mysqli_query($con , $strQuery);
				}

				/////perfil tickets soporte
				$strQuery = "SELECT id_ticket
							 FROM perfil_tickets_soporte 
							 WHERE id_puesto = {$intIdPuesto} ";
				$qTmp = mysqli_query($con, $strQuery);
				if ( mysqli_num_rows($qTmp) > 0 ) {
					$strQuery = "UPDATE usuario SET soporte = 1 WHERE id_usuario = {$intIdUsuario}";
					mysqli_query($con , $strQuery);
				}
				while ( $rTmp = mysqli_fetch_object($qTmp) ) {
					$strQuery = "INSERT INTO tickets_soporte(id_cargo, id_ticket, estado) 
								 VALUES( {$intIdCargo} , {$rTmp->id_ticket} , 1) ";
					mysqli_query($con, $strQuery);					
				}

				/////perfil tickets global
				$strQuery = "SELECT id_ticket
							 FROM perfil_tickets_soporte_global 
							 WHERE id_puesto = {$intIdPuesto}";
				$qTmp = mysqli_query($con, $strQuery);
				while( $rTmp = mysqli_fetch_object($qTmp) ) {
					$strQuery = "INSERT INTO tickets_soporte_global(id_usuario, id_ticket, estado) 
								 VALUES( {$intIdUsuario} , {$rTmp->id_ticket} 5, 1)";
					mysqli_query($con, $strQuery );
				}


			}

			$strQuery = "SELECT b.username , c.departamento
						 FROM departamento_puesto a
						 INNER JOIN usuario b ON a.id_usuario = b.id_usuario
						 INNER JOIN departamento c ON a.id_departamento = c.id_departamento
						 WHERE b.id_usuario = {$intIdUsuario}
						 AND c.id_departamento = {$intIdDepartamento}";
			$qTmp = mysqli_query($con , $strQuery);
			$rTmp = mysqli_fetch_object($qTmp);
			setHistorial($_POST['_usuario'] , "Asignación de usuario: {$rTmp->username} , Departamento: {$rTmp->departamento}" , $con);
			echo json_encode($intIdCargo);			
		} else {
			echo json_encode("error");
		}
	} else {
		echo json_encode("existe");
	}
}

if($_GET[accion]=='get_asignaciones_one'){
	$sql = mysqli_query($con, "SELECT dp.id_cargo, p.id_puesto, p.puesto, p.limitar_tickets, d.departamento, us.id_usuario, dp.soporte 
							   FROM usuario us, departamento_puesto dp, departamento d, puesto p 
							   WHERE p.id_puesto=dp.id_puesto 
							   AND dp.id_departamento=d.id_departamento 
							   AND dp.id_usuario=us.id_usuario 
							   AND us.id_usuario='$_POST[id_usuario]' ");

	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_cargo'=>($v->id_cargo),
			'id_puesto'=>($v->id_puesto),
			'puesto'=>($v->puesto),
			'departamento'=>($v->departamento),
			'id_usuario'=>($v->id_usuario),
			'limitar_tickets'=>($v->limitar_tickets),
			'soporte'=>($v->soporte),		
		);
	}
	echo json_encode($results);
}


if($_GET[accion]=='get_tickets_asignacion'){
	$sql = mysqli_query($con, "SELECT * FROM tickets_cargo WHERE id_cargo='$_POST[id_cargo]'");
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'id_cargo'=>($v->id_cargo),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'get_tickets_soporte' ) {
	$results = array();
	if ( $_POST[tipo] == 'asignacion' ) {
		$strQuery = "SELECT * FROM tickets_soporte WHERE id_cargo={$_POST[id_cargo]}";
		$sql = mysqli_query($con, $strQuery );
		while($v = mysqli_fetch_object($sql)){
			$results[] = array(
				'id_ticket'=>($v->id_ticket),
				'id_cargo'=>($v->id_cargo),
				'estado'=>($v->estado),
				'creacion'=>($v->creacion),
			);
		}
	}

	if($_POST[tipo]=='global'){
		$strQuery = "SELECT * FROM tickets_soporte_global WHERE id_usuario = { $_POST[id_usuario]} ";
		$sql = mysqli_query( $con , $strQuery );
		while($v = mysqli_fetch_object($sql)){
			$results[] = array(
				'id_ticket'=>($v->id_ticket),
				'id_usuario'=>($v->id_usuario),
				'estado'=>($v->estado),
				'creacion'=>($v->creacion),
			);
		}		
	}
	echo json_encode($results);
}

if($_GET[accion]=='guardar_perfil_tickets_cargo'){

	$data = json_decode($_POST["item"] , true );
	
	$exito=True;
	$sql_ = mysqli_query($con, "DELETE FROM tickets_cargo WHERE id_cargo={$_POST[id_cargo]} ");

	if(!$sql_){
		$exito=False;
	}

	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	if($elementCount!=0){
		for($i=0;$i<$elementCount;$i++){
			$strQuery = "INSERT INTO tickets_cargo(id_cargo, id_ticket, estado) 
						 VALUES({$_POST[id_cargo]}, {$json_array[$i]}, 1 ) ";
			$sql_2 = mysqli_query($con, $strQuery);
			if(!$sql_2){
				$exito=False;
			}
		}
	}

	if($exito){
		$strQuery = "SELECT username
					 FROM usuario
					 WHERE id_usuario = {$data['id_usuario']} ";
		$qTmp = mysqli_query($con,$strQuery);
		$rTmp = mysqli_fetch_array($qTmp);
		setHistorial($_POST['_usuario'] , "Cambio Ticket permitidas Usuario: {$rTmp['username']} Puesto : {$data['puesto']} , Departamento: {$data['departamento']}" , $con);
	  	echo json_encode("Ok");
	}else{
	  	echo json_encode("error");
	}
}


if($_GET[accion]=='guardar_perfil_tickets_soporte'){

	$exito=True;
	$sql_ = "";

	if($_POST[tipo]=='asignacion'){
		$strQuery = "DELETE FROM tickets_soporte 
					 WHERE id_cargo={$_POST['id_cargo']}";
		$sql_ = mysqli_query($con, $strQuery);
	}

	if($_POST[tipo]=='global'){
		$strQuery = "DELETE FROM tickets_soporte_global 
					 WHERE id_usuario={$_POST['id_usuario']}";
		$sql_ = mysqli_query($con, $strQuery);
	}

	if(!$sql_){
		$exito=False;
	}

	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	$sql_2="";
	if($elementCount!=0){

		for($i=0;$i<$elementCount;$i++){

			if($_POST[tipo]=='asignacion'){
				$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte(id_cargo, id_ticket, estado) 
											 VALUES({$_POST[id_cargo]}, {$json_array[$i]}, 1) ");
			}

			if($_POST[tipo]=='global'){
				$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte_global(id_usuario, id_ticket, estado) 
				                             VALUES({$_POST[id_usuario]}, {$json_array[$i]}, 1) ");
			}

			if(!$sql_2){
				$exito=False;
			}
		}
	}

	if($exito){
		setHistorial($_POST['_usuario'] , "Actualizacion del usuario: {$_POST['username']} , ticket soporte" , $con);
	  	echo json_encode("Ok");
	}else{
	  	echo json_encode("error");
	}
}

if($_GET[accion]=='cambiar_estado_soporte_asignacion'){

	$strQuery = "UPDATE departamento_puesto 
				 SET soporte={$_POST[estado]} 
				 WHERE id_cargo={$_POST[id_cargo]}";
	$sql = mysqli_query($con,  $strQuery);
	if ( $sql ){
		setHistorial($_POST['_usuario'] , "Actualizacion del usuario: {$_POST['username']} , para brindar soporte." , $con);
	  	echo json_encode("Ok");
	}else{
	  	echo json_encode("error");
	}
}



if($_GET[accion]=='get_tickets_usuario'){
	$strQuery =  "SELECT tc.id_cargo, tc.id_ticket, tc.estado, tc.creacion, t.nombre_ticket, t.descripcion,
						 t.prioridad_recomendada, p.puesto, d.id_departamento, d.departamento 
				  FROM tickets_cargo tc, ticket t, puesto p, departamento_puesto dp, departamento d, usuario us 
				  WHERE t.id_ticket=tc.id_ticket 
				  AND tc.id_cargo=dp.id_cargo 
				  AND dp.id_puesto=p.id_puesto 
				  AND dp.id_departamento=d.id_departamento 
				  AND dp.id_usuario=us.id_usuario 
				  AND us.id_usuario={$_POST[id_usuario]}
				  GROUP BY tc.id_ticket";
	$sql = mysqli_query($con,$strQuery);

	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_cargo'=>($v->id_cargo),
			'id_ticket'=>($v->id_ticket),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
			'nombre_ticket'=>($v->nombre_ticket),
			'prioridad_recomendada'=>($v->prioridad_recomendada),
			'descripcion'=>($v->descripcion),
			'puesto'=>($v->puesto),
			'id_departamento'=>($v->id_departamento),
			'departamento'=>($v->departamento),
			'estado_final'=>(estado_ticket_usuario($v->id_ticket, $v->id_cargo, $con)),	
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'get_departamentos_one' ) {
	$strQuery = "SELECT d.departamento, dp.id_departamento 
				 FROM departamento_puesto dp, departamento d 
				 WHERE dp.id_departamento=d.id_departamento 
				 AND dp.id_usuario='$_POST[id_usuario]'
				 GROUP BY dp.id_departamento ";
	$sql = mysqli_query($con, $strQuery );
	//Create an array with the results
	$results = array();
	while ( $v = mysqli_fetch_object($sql) ) {
		$results[] = array(
			'id_departamento'=>($v->id_departamento),
			'departamento'=>($v->departamento),	
		);
	}
	echo json_encode($results);
}

if($_GET[accion]=='get_usuarios_departamento_one'){


	$sql = mysqli_query($con,  "SELECT us.id_usuario, us.nombre_completo FROM departamento_puesto dp, usuario us WHERE dp.id_usuario=us.id_usuario AND dp.id_departamento='$_POST[id_departamento]' AND us.estado=1 GROUP BY us.id_usuario ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_usuario'=>($v->id_usuario),
	'nombre_completo'=>($v->nombre_completo),
	
	);

	}

	echo json_encode($results);

}

if ( $_GET[accion] == 'get_ticket_por_usuario' ) {
	$intIdUsuarioTicket = isset($_GET['id_ticket']) ? intval($_GET['id_ticket']) : 0;
	$res["err"] = "true";
	if ( $intIdUsuarioTicket > 0 ) {
		$strQuery = "SELECT a.nombre_completo  ,
							b.id_usuario_ticket,  b.nivel_prioridad, b.creacion, b.programada, b.fecha_programada, b.info_adicional , b.correlativo , 
							b.estado, b.id_calificacion ,
							c.id_ticket,   c.nombre_ticket,   c.descripcion, 
							e.departamento ,
							f.puesto,
							IF ( b.id_tecnico IS NULL , 'Sin Asignar' ,   g.nombre_completo  ) AS nombre_tecnico
					FROM usuario a 
					INNER JOIN usuario_ticket b ON a.id_usuario = b.id_usuario  
					INNER JOIN ticket c ON b.id_ticket = c.id_ticket 
					INNER JOIN departamento_puesto d ON b.id_cargo = d.id_cargo
					INNER JOIN departamento e ON d.id_departamento = e.id_departamento 
					INNER JOIN puesto f ON d.id_puesto = f.id_puesto 
					LEFT JOIN usuario g ON b.id_tecnico = g.id_usuario
					WHERE b.id_usuario_ticket = {$intIdUsuarioTicket}";
		$qTmp = mysqli_query($con , $strQuery);
		if ( mysqli_num_rows($qTmp) > 0 ) {
			$res["err"] = "false";
			$res["ticket"] = mysqli_fetch_assoc($qTmp);
		}		
	}
	print(json_encode($res));
}

if ( $_GET[accion] == 'get_tickets_abiertas_usuario' ) {
	$intRol = isset($_POST['rol']) ? intval($_POST['rol']) : 0;
	if ( $intRol <= 1 ) {
		$_AND = "WHERE b.id_usuario = {$_POST['id_usuario']}";
	}

	if ( $intRol == 2 ) {
		$_AND = "WHERE d.id_departamento IN (SELECT b.id_departamento 
											   FROM usuario a
											   INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
											   WHERE a.id_usuario = {$_POST['id_usuario']}
											   GROUP BY b.id_departamento)";
	}

	$strQuery = "SELECT a.nombre_completo  ,
					b.id_usuario_ticket,  b.nivel_prioridad, b.creacion, b.programada, b.fecha_programada, b.info_adicional , b.correlativo , 
					b.estado,
					c.id_ticket,   c.nombre_ticket,   c.descripcion, 
					e.departamento ,
					f.puesto,
					IF ( b.id_tecnico IS NULL , 'Sin Asignar' ,   g.nombre_completo  ) AS nombre_tecnico ,
					h.calificacion
				FROM usuario a 
				INNER JOIN usuario_ticket b ON a.id_usuario = b.id_usuario 
				INNER JOIN ticket c ON b.id_ticket = c.id_ticket 
				INNER JOIN departamento_puesto d ON b.id_cargo = d.id_cargo
				INNER JOIN departamento e ON d.id_departamento = e.id_departamento 
				INNER JOIN puesto f ON d.id_puesto = f.id_puesto 
				LEFT JOIN usuario g ON b.id_tecnico = g.id_usuario
				LEFT JOIN calificacion_ticket h ON b.id_usuario_ticket = h.id_usuario_ticket
				WHERE h.calificacion IS NULL
				{$_AND}
				GROUP BY b.id_usuario_ticket
				ORDER BY b.creacion DESC";

	$qTemp = mysqli_query($con, $strQuery);

	 //cantidad fases
	 $exe_p = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM fase WHERE estado=1");
	 $row_p = mysqli_fetch_assoc($exe_p);
	 $cantidad_fases = $row_p['NUMBER_ROW'];

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($qTemp)){

	//cantidad fases ticket
		$exe_p2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario_ticket_fase where id_usuario_ticket=$v->id_usuario_ticket");
		$row_p2 = mysqli_fetch_assoc($exe_p2);
		$cantidad_fases_ticket = $row_p2['NUMBER_ROW'];

		$results[] = array(
			'id_usuario_ticket'=>($v->id_usuario_ticket),
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'estado'=>($v->estado),
			'descripcion'=>($v->descripcion),
			'nivel_prioridad'=>($v->nivel_prioridad),
			'creacion'=>($v->creacion),
			'programada'=>($v->programada),
			'fecha_programada'=>($v->fecha_programada),
			'info_adicional'=>($v->info_adicional),
			'puesto'=>($v->puesto),
			'departamento'=>($v->departamento),
			'total_fases'=>($cantidad_fases),
			'total_fases_ticket'=>($cantidad_fases_ticket),
			'nombre_completo'=>($v->nombre_completo),
			'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),
			'nombre_tecnico'=>($v->nombre_tecnico),
			'correlativo'=>($v->correlativo),
			'calificacion'=>($v->calificacion),
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'get_tickets_cerradas_usuario' ) {
	
	$fecha = new DateTime($_POST['mes']);
	$fecha->modify('first day of this month');
	$fecha_init = $fecha->format('Y-m-d')." 00:00:00";
	
	$fecha->modify('last day of this month');
	$fecha_fin = $fecha->format('Y-m-d')." 23:59:59";

	$intRol = isset($_POST['rol']) ? intval($_POST['rol']) : 0;
	if ( $intRol <= 1 ) {
		$_AND = "AND ut.id_usuario = {$_POST['id_usuario']}";
	}

	if ( $intRol == 2 ) {
		$_AND = "AND dp.id_departamento IN (SELECT b.id_departamento 
										    FROM usuario a
										    INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
										    WHERE a.id_usuario = {$_POST['id_usuario']}
										    GROUP BY b.id_departamento)";
	}

	$sql = mysqli_query($con,  "SELECT ut.correlativo , ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, t.descripcion, ut.estado, 
									   ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional , fecha_fin , 
									   p.puesto, d.departamento, us.nombre_completo  
								FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p 
								WHERE t.id_ticket = ut.id_ticket 
								AND ut.id_usuario = us.id_usuario 
								AND ut.id_cargo = dp.id_cargo 
								AND dp.id_departamento = d.id_departamento 
								AND dp.id_puesto = p.id_puesto 
								AND ut.estado = 1 
								{$_AND}
								AND ut.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
								GROUP BY ut.id_usuario_ticket
								ORDER BY ut.fecha_fin DESC");

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_usuario_ticket'=>($v->id_usuario_ticket),
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'estado'=>($v->estado),
			'descripcion'=>($v->descripcion),
			'nivel_prioridad'=>($v->nivel_prioridad),
			'creacion'=>($v->creacion),
			'programada'=>($v->programada),
			'fecha_programada'=>($v->fecha_programada),
			'info_adicional'=>($v->info_adicional),
			'puesto'=>($v->puesto),
			'departamento'=>($v->departamento),
			'nombre_completo'=>($v->nombre_completo),
			'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),
			'correlativo'=>($v->correlativo) ,
			'fecha_fin'=>($v->fecha_fin) 	
		);
	}
	echo json_encode($results);
}

if($_GET[accion]=='get_tickets_abiertas_soporte'){
	
	$intRol = isset($_POST['rol']) ? intval($_POST['rol']) : 0;
	$date = array();
	if(!empty($_POST[fecha])){
		$fecha_de= $_POST[fecha].' 00:00:00';
		$fecha_a= $_POST[fecha].' 23:59:59';
		$date[0] = "AND b.fecha_programada BETWEEN '{$fecha_de}' AND '{$fecha_a}'";
		$date[1] = "AND e.fecha_programada BETWEEN '{$fecha_de}' AND '{$fecha_a}'";
		$date[2] = "AND d.fecha_programada BETWEEN '{$fecha_de}' AND '{$fecha_a}'";
	}	

	if ( $intRol <= 1 ) {
		$strQuery = "	SELECT a.nombre_completo  ,
								b.id_usuario_ticket , b.estado , b.nivel_prioridad , b.creacion , b.programada , b.fecha_programada , 
								b.info_adicional , b.correlativo ,
								c.id_ticket , c.nombre_ticket , c.descripcion ,
								e.departamento ,
								f.puesto 
						FROM usuario a 
						INNER JOIN usuario_ticket b ON a.id_usuario = b.id_usuario 
						INNER JOIN ticket c ON b.id_ticket = c.id_ticket 
						INNER JOIN departamento_puesto d ON b.id_cargo = d.id_cargo 
						INNER JOIN departamento e ON d.id_departamento = e.id_departamento 
						INNER JOIN puesto f ON d.id_puesto = f.id_puesto 
						WHERE b.estado = 0
						AND b.id_tecnico = {$_POST['id_usuario']}
						{$date[0]}
						GROUP BY b.id_usuario_ticket				
					UNION				
						SELECT f.nombre_completo ,
								e.id_usuario_ticket , e.estado , e.nivel_prioridad , e.creacion , e.programada , e.fecha_programada ,
								e.info_adicional , e.correlativo ,
								d.id_ticket , d.nombre_ticket , d.descripcion ,
								h.departamento ,
								i.puesto
						FROM usuario a
						INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario 
						LEFT JOIN tickets_soporte c ON b.id_cargo = c.id_cargo
						INNER JOIN ticket d ON c.id_ticket = d.id_ticket
						INNER JOIN usuario_ticket e ON d.id_ticket = e.id_ticket
						LEFT JOIN usuario f ON e.id_usuario = f.id_usuario 
						INNER JOIN departamento_puesto g ON e.id_cargo = g.id_cargo
						INNER JOIN departamento h ON g.id_departamento = h.id_departamento
						INNER JOIN puesto i ON g.id_puesto = i.id_puesto
						WHERE a.id_usuario = {$_POST['id_usuario']}
						AND e.estado = 0 AND e.id_tecnico IS NULL
						{$date[1]}
						GROUP BY e.id_usuario_ticket				
					UNION 				
						SELECT e.nombre_completo ,
								d.id_usuario_ticket , d.estado , d.nivel_prioridad , d.creacion , d.programada , d.fecha_programada , 
								d.info_adicional , d.correlativo ,
								c.id_ticket , c.nombre_ticket , c.descripcion ,
								g.departamento ,
								h.puesto 
						FROM usuario a 
						INNER JOIN tickets_soporte_global b ON a.id_usuario = b.id_usuario
						INNER JOIN ticket c ON b.id_ticket = c.id_ticket 
						INNER JOIN usuario_ticket d ON c.id_ticket = d.id_ticket 
						LEFT JOIN usuario e ON d.id_usuario = e.id_usuario 
						INNER JOIN departamento_puesto f ON d.id_usuario = f.id_usuario 
						INNER JOIN departamento g ON f.id_departamento = g.id_departamento 
						INNER JOIN puesto h ON f.id_puesto = h.id_puesto 
						WHERE a.id_usuario = {$_POST['id_usuario']}
						AND d.estado = 0 
						AND d.id_tecnico IS NULL
						{$date[2]}
						GROUP BY d.id_usuario_ticket
					ORDER BY fecha_programada DESC";
	} else {
		$_AND = ($intRol == 2) ? "AND d.id_departamento IN (SELECT b.id_departamento 
															FROM usuario a
															INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
															WHERE a.id_usuario = {$_POST['id_usuario']}
															GROUP BY b.id_departamento)" : "";
		$strQuery = "SELECT a.nombre_completo  ,
							b.id_usuario_ticket , b.estado , b.nivel_prioridad , b.creacion , b.programada , b.fecha_programada , 
							b.info_adicional , b.correlativo ,
							c.id_ticket , c.nombre_ticket , c.descripcion ,
							e.departamento ,
							f.puesto 
					FROM usuario a 
					INNER JOIN usuario_ticket b ON a.id_usuario = b.id_usuario 
					INNER JOIN ticket c ON b.id_ticket = c.id_ticket 
					INNER JOIN departamento_puesto d ON b.id_cargo = d.id_cargo 
					INNER JOIN departamento e ON d.id_departamento = e.id_departamento 
					INNER JOIN puesto f ON d.id_puesto = f.id_puesto 
					WHERE b.estado = 0
					{$date[0]}	
					{$_AND}				
					GROUP BY b.id_usuario_ticket
					ORDER BY b.fecha_programada";
	}
	
	$sql = mysqli_query($con, $strQuery);
	
	//cantidad fases
	 $exe_p = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW 
	                              FROM fase 
								  WHERE estado=1");
	 $row_p = mysqli_fetch_assoc($exe_p);
	 $cantidad_fases = $row_p['NUMBER_ROW'];

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){

		//cantidad fases ticket
		 $exe_p2 = mysqli_query($con,  "SELECT COUNT(*) AS NUMBER_ROW 
										FROM usuario_ticket_fase 
										where id_usuario_ticket=$v->id_usuario_ticket");
		 $row_p2 = mysqli_fetch_assoc($exe_p2);
		 $cantidad_fases_ticket = $row_p2['NUMBER_ROW'];


		$results[] = array(
			'id_usuario_ticket'=>($v->id_usuario_ticket),
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'estado'=>($v->estado),
			'descripcion'=>($v->descripcion),
			'nivel_prioridad'=>($v->nivel_prioridad),
			'creacion'=>($v->creacion),
			'programada'=>($v->programada),
			'fecha_programada'=>($v->fecha_programada),
			'info_adicional'=>($v->info_adicional),
			'puesto'=>($v->puesto),
			'departamento'=>($v->departamento),
			'total_fases'=>($cantidad_fases),
			'total_fases_ticket'=>($cantidad_fases_ticket),
			'nombre_completo'=>($v->nombre_completo),
			'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),	
			'correlativo'=>($v->correlativo)	
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'get_tickets_cerradas_soporte' ) {

	$fecha = new DateTime($_POST['mes']);
	$fecha->modify('first day of this month');
	$fecha_init = $fecha->format('Y-m-d')." 00:00:00";
	
	$fecha->modify('last day of this month');
	$fecha_fin = $fecha->format('Y-m-d')." 23:59:59";

	$intRol = isset($_POST['rol']) ? intval($_POST['rol']) : 0;
	if ( $intRol == 1 ) {
		$_AND = "AND ut.id_tecnico = {$_POST['id_usuario']} ";
	}

	if ( $intRol == 2 ) {
		$_AND = "AND dp.id_departamento IN (SELECT b.id_departamento 
										    FROM usuario a
										    INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
										    WHERE a.id_usuario = {$_POST['id_usuario']}
										    GROUP BY b.id_departamento)";
	}

	$sql = mysqli_query($con,  "SELECT ut.correlativo , ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, ut.estado, t.descripcion, 
									   ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, fecha_fin ,
									   p.puesto, d.departamento, us.nombre_completo  
								FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p 
								WHERE t.id_ticket = ut.id_ticket 
								AND ut.id_usuario=us.id_usuario 
								AND ut.id_cargo = dp.id_cargo 
								AND dp.id_departamento=d.id_departamento 
								AND dp.id_puesto = p.id_puesto 
								AND ut.estado=1 								
								{$_AND}								
								AND ut.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
								GROUP BY ut.id_usuario_ticket
								ORDER BY ut.fecha_fin DESC");

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_usuario_ticket'=>($v->id_usuario_ticket),
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'estado'=>($v->estado),
			'descripcion'=>($v->descripcion),
			'nivel_prioridad'=>($v->nivel_prioridad),
			'creacion'=>($v->creacion),
			'programada'=>($v->programada),
			'fecha_programada'=>($v->fecha_programada),
			'info_adicional'=>($v->info_adicional),
			'puesto'=>($v->puesto),
			'departamento'=>($v->departamento),
			'nombre_completo'=>($v->nombre_completo),
			'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),
			'correlativo'=>($v->correlativo) ,
			'fecha_fin'=>($v->fecha_fin)		
		);
	}
	echo json_encode($results);

}

	if($_GET[accion]=='get_perfil_permisos_usuario'){
		$id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0;
		$id_puesto = isset($_GET['id_puesto']) ? intval($_GET['id_puesto']) : 0;
		if ( $id_usuario != 0) {

			$strQuery = "SELECT c.id_accion
						FROM usuario_permisos a 
						INNER JOIN puesto b ON a.id_perfil_permisos = b.id_perfil_permisos
						INNER JOIN accion c ON a.id_accion = c.id_accion
						WHERE a.id_usuario = {$id_usuario}
						AND b.id_puesto = {$id_puesto}";
			$qTpm = mysqli_query($con, $strQuery);
			$activos = array();
			$index = 0;
			while ($rTmp = mysqli_fetch_array($qTpm)) {
				$activos[$index] = $rTmp["id_accion"];
				$index++;
			}

			$arr = array();
			$modulo = null;
			$index1 = 0;		
			$index2 = 0;
			
			$strQuery = "SELECT a.id_accion , a.accion ,
								b.id_modulo , b.modulo
						 FROM accion a 
						 INNER JOIN modulo b ON a.id_modulo = b.id_modulo
						 AND a.estado = 1
						 AND b.estado = 1
						 ORDER BY a.id_modulo";
			$qTpm = mysqli_query($con, $strQuery);
			while ( $rTmp = mysqli_fetch_array($qTpm)) {
				if ($modulo ==  $rTmp["modulo"]) {
					$index2 ++;
				} else {
					$index1 = ($modulo == null) ? 0 : $index1 + 1;
					$modulo = $rTmp["modulo"]; 
					$index2 = 0;				
				}
				$arr[$index1][$rTmp["modulo"]][$index2]["accion"] = $rTmp["accion"];
				$arr[$index1][$rTmp["modulo"]][$index2]["id_accion"] = $rTmp["id_accion"];
				$arr[$index1][$rTmp["modulo"]][$index2]["id_modulo"] = $rTmp["id_modulo"];
			}
			
			$res["err"] = "false";
			$res["perfil_permisos"] = $arr;
			$res["activos"] = $activos;
			print(json_encode($res));
		} else {
			$res["err"] = "true";
			$res["mns"] = "no cuenta con puesto asignado.";
			print(json_encode($res));	
		}
	}

	if ($_GET[accion]=='get_perfil_usuario') {
		$id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0;
		$res['err'] = 'true';
		if ( $id_usuario != 0 ) {
			$strQuery = "SELECT c.id_puesto , c.puesto , c.id_perfil_permisos
						 FROM usuario a 
						 INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
						 INNER JOIN puesto c ON b.id_puesto = c.id_puesto
						 WHERE a.id_usuario = {$id_usuario}
						 AND c.id_perfil_permisos IS NOT NULL
						 GROUP BY c.puesto ASC";
			$qTpm = mysqli_query($con, $strQuery);
			$arr = array();
			while($rTmp = mysqli_fetch_object($qTpm)){
				$arr[] = array(
					'id_puesto' => ($rTmp->id_puesto) ,
					'puesto' => ($rTmp->puesto) ,
					'id_perfil_permisos' => ($rTmp->id_perfil_permisos),
				);
			}
			if ( mysqli_num_rows($qTpm) > 0 ) {
				$res['perfiles'] = $arr;
				$res['err'] = 'false';
			}						
		} 
		print(json_encode($res));
	}

	if ($_GET[accion]=='save_perfil_permisos_usuario') {
		$id_perfil_permisos = isset($_POST['id_perfil_permisos']) ? intval($_POST['id_perfil_permisos']) : 0;
		$id_usuario = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;
		$activos = isset($_POST['activos']) ? $_POST['activos'] : 0;

		if ( $id_perfil_permisos != 0 && $id_usuario != 0) {
			$strQuery = "DELETE FROM usuario_permisos 
						 WHERE id_perfil_permisos = {$id_perfil_permisos}
						 AND id_usuario = {$id_usuario}";
			mysqli_query($con, $strQuery);

			foreach ( explode("," , $activos) as $key => $id_accion) {
				$strQuery = "INSERT INTO usuario_permisos (id_accion , id_usuario , id_perfil_permisos)
							 VALUES ({$id_accion} , {$id_usuario} , {$id_perfil_permisos})";
				mysqli_query($con,$strQuery);
			}

			$strQuery = "SELECT username 
						 FROM usuario
						 WHERE id_usuario = {$id_usuario}";
			$qTmp = mysqli_query($con,$strQuery);
			$rTmp = mysqli_fetch_array($qTmp);
			setHistorial($_POST['_usuario'] , "Actualizacion de permisos de modulos, usuario: {$rTmp['username']}" , $con);
			$res['mns'] = 'Los cambios fueron guardados exitosamente.';
		} else {
			$res['mns'] = 'falta informacion.';
		}
		print(json_encode($res));		
	}

	if ($_GET['accion'] == 'get_rol_usuarios') {
		if ( $_GET['rol'] != 3 ) {
			$_AND = "WHERE id_rol NOT IN(3)";
		}
		$strQuery = "SELECT id_rol , rol 
					 FROM rol
					 {$_AND}";
		$qTmp = mysqli_query($con , $strQuery);
		$arr = array();
		while($rTmp = mysqli_fetch_object($qTmp)){
			$arr[] = array(
				'id_rol' => ($rTmp->id_rol) ,
				'rol' => ($rTmp->rol) 
			);
		}
		print(json_encode($arr));
	}

	if ($_GET['accion'] == 'get_historial') {

		$fecha = new DateTime();
		$fecha->modify('first day of this month');
		$fecha_init = $fecha->format('Y-m-d')." 00:00:00";
		
		$fecha->modify('last day of this month');
		$fecha_fin = $fecha->format('Y-m-d')." 23:59:59";

		$strQuery = "SELECT accion , creacion 
					 FROM historial 
					 WHERE id_usuario = {$_GET['id_usuario']}
					 AND creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}' 
					 ORDER BY creacion DESC";
		$qTmp = mysqli_query($con , $strQuery);
		$arr = array();
		while($rTmp = mysqli_fetch_object($qTmp)){
			$arr[] = array(
				'accion' => ($rTmp->accion) ,
				'creacion' => ($rTmp->creacion) 
			);
		}
		print(json_encode($arr));
	}

	mysqli_close($con);
?>