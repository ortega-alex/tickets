<?php

include("../conexion.php");
$con=conexion();
include("./estado_tickets.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 
include("../helper.php");

if($_GET[accion]=='nueva_categoria'){

	$intEstado = intval($_POST[estado]);
	$strNombre = isset($_POST['nombre_categoria']) ? trim($_POST['nombre_categoria']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( !empty($strNombre) ) {
		$strQuery = "INSERT INTO categoria(categoria, estado) 
								 VALUES('{$strNombre}', {$intEstado})";
		if(mysqli_query($con,  $strQuery)){
			setHistorial($intUsuario , "Nueva categoria : {$strNombre}" , $con);
			$lastid=mysqli_insert_id($con);
			echo json_encode($lastid);
		} else {
			echo json_encode("error");
		}
	} else {
		echo json_encode("error");
	}
}

if($_GET[accion]=='get_categorias'){

	$sql = mysqli_query($con, "SELECT * FROM categoria ORDER BY creacion");
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_categoria'=>($v->id_categoria),
			'categoria'=>($v->categoria),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
			'estado_final'=>(estado_categoria($v->id_categoria, $con)),
		);
	}
	echo json_encode($results);
}

if($_GET[accion]=='edit'){


	$sql = mysqli_query($con, "UPDATE categoria SET categoria='$_POST[nombre_categoria]', estado='$_POST[estado]' WHERE id_categoria='$_POST[id_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='nueva_sub_categoria'){

	$strNombreCategoria = isset($_POST['nombre_categoria']) ? trim($_POST['nombre_categoria']) : null;
	$intEstado = intval($_POST['estado']);
	$intIdCategoria = isset($_POST['id_categoria']) ? intval($_POST['id_categoria']) : 0;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	
	if ( $intIdCategoria > 0 && !empty($strNombreCategoria) ) {
		$strQuery = "INSERT INTO sub_categoria(sub_categoria, id_categoria, estado) 
								 VALUES('{$strNombreCategoria}', {$intIdCategoria}, {$intEstado} )";
		if ( mysqli_query($con,  $strQuery) ) {
			setHistorial($intUsuario , "Nueva sub Categoria: {$strNombreCategoria}" , $con);
			$lastid=mysqli_insert_id($con);
			echo json_encode($lastid);
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if($_GET[accion]=='get_sub_categorias'){

	$sql = mysqli_query($con, "SELECT * FROM sub_categoria WHERE id_categoria='$_POST[id_categoria]' ORDER BY creacion ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_sub_categoria'=>($v->id_sub_categoria),
	'sub_categoria'=>($v->sub_categoria),
	'id_categoria'=>($v->id_categoria),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),

	'estado_final'=>(estado_sub_categoria($v->id_sub_categoria, $con)),

	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='nueva_ticket'){

	$strTitulo = isset($_POST['titulo_ticket']) ? trim($_POST['titulo_ticket']) : null;
	$strDescripcion = trim($_POST['descripcion']);
	$intSubCategoria = isset($_POST['sub_categoria']) ? intval($_POST['sub_categoria']) : 0;
	$intMinutos = isset($_POST['minutos_estimados']) ? intval($_POST['minutos_estimados']) : 0;
	$intPrioridad = isset($_POST['prioridad']) ? intval($_POST['prioridad']) : 0;
	$intEstado = intval($_POST['estado']);
	$strProcedimiento = trim($_POST['procedimiento']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$strCategoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : null;

	if ( !empty($strTitulo) && $intSubCategoria > 0 && $intMinutos > 0 && $intPrioridad > 0 ) {
		$strQuery = "INSERT INTO ticket(nombre_ticket, descripcion, id_sub_categoria, tiempo_estimado, 
															prioridad_recomendada, estado, procedimiento) 
								 VALUES('{$strTitulo}' , '{$strDescripcion}', {$intSubCategoria}, {$intMinutos}, 
													{$intPrioridad} , {$intEstado} , '{$strProcedimiento}')";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';			 
			setHistorial($intUsuario , "Nuevo ticket: {$strTitulo}, Categoria: {$strCategoria}, Estado: {$strEstado}" , $con);
			$lastid=mysqli_insert_id($con);
			echo json_encode($lastid);
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if($_GET[accion]=='get_tickets'){

	$query="SELECT t.id_ticket, t.nombre_ticket, t.descripcion, t.id_sub_categoria, t.tiempo_estimado, t.prioridad_recomendada, 
								 t.estado, t.creacion, t.procedimiento 
					FROM ticket t, categoria c, sub_categoria s 
					WHERE 1 
					AND c.id_categoria={$_POST[id_categoria]} 
					AND c.id_categoria=s.id_categoria 
					AND s.id_sub_categoria=t.id_sub_categoria";

	$subcat=intval($_POST[sub_categoria]);
	if ( $subcat>0 ) {
		$query=$query." AND s.id_sub_categoria={$_POST[sub_categoria]}";
	}
	
	$query=$query." ORDER BY t.creacion ";

	$sql = mysqli_query($con,  $query);

	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'descripcion'=>($v->descripcion),
			'id_sub_categoria'=>($v->id_sub_categoria),
			'tiempo_estimado'=>($v->tiempo_estimado),
			'prioridad_recomendada'=>($v->prioridad_recomendada),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
			'procedimiento'=>($v->procedimiento),
			'estado_final'=>(estado_ticket($v->id_ticket, $con)),			
		);
	}
	echo json_encode($results);
}

if($_GET[accion]=='get_ticket'){
	$strQuery = "SELECT * FROM ticket WHERE id_ticket={$_POST[id_ticket]}";
	$qTmp = mysqli_query($con, $strQuery);
	$row = mysqli_fetch_object($qTmp);

	$jsondata['id_ticket'] = $row->id_ticket;
	$jsondata['nombre_ticket'] = $row->nombre_ticket;
	$jsondata['descripcion'] = $row->descripcion;
	$jsondata['id_sub_categoria'] = $row->id_sub_categoria;
	$jsondata['tiempo_estimado'] = $row->tiempo_estimado;
	$jsondata['prioridad_recomendada'] = $row->prioridad_recomendada;
	$jsondata['estado'] = $row->estado;
	$jsondata['creacion'] = $row->creacion;
	$jsondata['procedimiento'] = $row->procedimiento;
	$jsondata['sub_categoria'] = (json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM sub_categoria WHERE id_sub_categoria=$row->id_sub_categoria "))) );
	$jsondata['categoria'] =(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM categoria c, sub_categoria sb WHERE c.id_categoria=sb.id_categoria AND sb.id_sub_categoria=$row->id_sub_categoria "))) );
	$jsondata['estado_final']=(estado_ticket($row->id_ticket, $con));

	echo json_encode($jsondata);
}


if($_GET[accion]=='edit_ticket'){

	$intIdTicket = isset($_POST['id_ticket']) ? intval($_POST['id_ticket']) : 0;
	$strTitulo = isset($_POST['titulo_ticket']) ? trim($_POST['titulo_ticket']) : null;
	$strDescripcion = trim($_POST['descripcion']);
	$intSubCategoria = isset($_POST['sub_categoria']) ? intval($_POST['sub_categoria']) : 0;
	$intMinutos = isset($_POST['minutos_estimados']) ? intval($_POST['minutos_estimados']) : 0;
	$intPrioridad = isset($_POST['prioridad']) ? intval($_POST['prioridad']) : 0;
	$intEstado = intval($_POST['estado']);
	$strProcedimiento = trim($_POST['procedimiento']);
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$strCategoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : null;

	if ( !empty($strTitulo) && $intSubCategoria > 0 && $intMinutos > 0 && $intPrioridad > 0 && $intIdTicket > 0 ) {
		$strQuery = "UPDATE ticket 
								 SET nombre_ticket='{$strTitulo}' , 
										 descripcion='{$strDescripcion}' , 
										 id_sub_categoria={$intSubCategoria} , 
										 tiempo_estimado={$intMinutos}, 
										 prioridad_recomendada={$intPrioridad} , 
										 estado={$intEstado}, 
										 procedimiento='{$strProcedimiento}' 
								 WHERE id_ticket={$intIdTicket}";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';			 
			setHistorial($intUsuario , "Actualizacion de ticket: {$strTitulo}, Categoria: {$strCategoria}, Estado: {$strEstado}" , $con);
			$lastid=mysqli_insert_id($con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if($_GET[accion]=='estado'){

	$intEstado = intval($_POST['estado']);
	$intIdTicket = isset($_POST['id_ticket']) ? intval($_POST['id_ticket']) : 0;
	$strTicket = isset($_POST['ticket']) ? trim($_POST['ticket']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdTicket > 0 ) {
		$strQuery = "UPDATE ticket 
								 SET estado={$intEstado} 
								 WHERE id_ticket={$intIdTicket}";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';			 
			setHistorial($intUsuario , "Actualizacion de ticket: {$strTicket}, se dio de: {$strEstado}" , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if($_GET[accion]=='estado_cat'){
	$intEstado = intval($_POST['estado']);
	$intIdCategoria = isset($_POST['id_categoria']) ? intval($_POST['id_categoria']) : 0;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$strCategoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : null;
	if ( $intIdCategoria > 0 ) {
		$strQuery =  "UPDATE categoria 
									SET estado={$intEstado} 
									WHERE id_categoria={$intIdCategoria}";
		if ( mysqli_query($con, $strQuery) ){
			$strEstdo = ($intEstado == 0) ? 'Baja' : 'Alta'; 
			setHistorial($intUsuario , "Categoria: {$strCategoria} se dio de {$strEstdo}." , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
		echo json_encode("error");
	}
}

if($_GET[accion]=='estado_sub_cat'){
	$intIdSubCategoria = isset($_POST['id_sub_categoria']) ? intval($_POST['id_sub_categoria']) : 0;
	$intEstado = intval($_POST['estado']);
	$strSubCategoria = isset($_POST['sub_categoria']) ? trim($_POST['sub_categoria']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdSubCategoria > 0 && !empty($strSubCategoria) ) {
		$strQuery = "	UPDATE sub_categoria 
									SET estado = {$intEstado} 
									WHERE id_sub_categoria = {$intIdSubCategoria}";
		if ( mysqli_query($con, $strQuery )) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización de sub categoria: {$strSubCategoria} , Estado: {$strEstado}" , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}

if($_GET[accion]=='edit_categoria'){
	$intEstado = intval($_POST[estado]);
	$strNombre = isset($_POST['nombre_categoria']) ? trim($_POST['nombre_categoria']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intIdCategoria = isset($_POST['id_categoria']) ? intval($_POST['id_categoria']) : 0;

	if ( !empty($strNombre) && $intIdCategoria > 0 ) {
		$strQuery = "	UPDATE categoria 
									SET categoria = '{$strNombre}', 
											estado = {$intEstado} 
									WHERE id_categoria = {$intIdCategoria}";
		if ( mysqli_query( $con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actulización categoria : {$strNombre} , Estado: {$strEstado}." , $con);
			echo json_encode("Ok");
		}else{
			echo json_encode("error");
		}
	}
}

if($_GET[accion]=='edit_sub_categoria'){

	$strNombreCategoria = isset($_POST['nombre_categoria']) ? trim($_POST['nombre_categoria']) : null;
	$intEstado = intval($_POST['estado']);
	$intIdCategoria = isset($_POST['id_categoria']) ? intval($_POST['id_categoria']) : 0;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intIdSubCategoria = isset($_POST['id_sub_categoria']) ? intval($_POST['id_sub_categoria']) : 0;
	
	if ( $intIdSubCategoria > 0 && !empty($strNombreCategoria) ) {
		$strQuery = "	UPDATE sub_categoria 
									SET sub_categoria = '{$strNombreCategoria}', 
											estado = {$intEstado} 
											WHERE id_sub_categoria = {$intIdSubCategoria} ";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización de sub categoria: {$strNombreCategoria} , Estado: {$strEstado}" , $con);
	  	echo json_encode("Ok");
		} else {
	  	echo json_encode("error");
		}
	} else {
		echo json_encode("error");
	}
}

if($_GET[accion]=='get_tickets_all'){

	$strQuery="SELECT c.categoria, c.id_categoria, s.sub_categoria, s.id_sub_categoria, t.id_ticket, t.nombre_ticket, 
								 t.descripcion, t.tiempo_estimado, t.prioridad_recomendada, t.estado, t.creacion, t.procedimiento 
					FROM ticket t, categoria c, sub_categoria s 
					WHERE 1 
					AND c.id_categoria=s.id_categoria 
					AND s.id_sub_categoria=t.id_sub_categoria  
					ORDER BY c.categoria, s.sub_categoria";
	$sql = mysqli_query($con,  $strQuery);
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'categoria'=>($v->categoria),
			'id_categoria'=>($v->id_categoria),
			'sub_categoria'=>($v->sub_categoria),
			'id_sub_categoria'=>($v->id_sub_categoria),
			'id_ticket'=>($v->id_ticket),
			'nombre_ticket'=>($v->nombre_ticket),
			'descripcion'=>($v->descripcion),
			'tiempo_estimado'=>($v->tiempo_estimado),
			'prioridad_recomendada'=>($v->prioridad_recomendada),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
			'procedimiento'=>($v->procedimiento),
			'estado_final'=>(estado_ticket($v->id_ticket, $con)),
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'aperturar_ticket' ) {
	$strCorrelativo = date("Ymd").time();
	$strQuery = "INSERT INTO usuario_ticket ( id_ticket, id_usuario, id_cargo, nivel_prioridad, 
													 programada, fecha_programada, info_adicional , correlativo ) 
							 VALUES( {$_POST[id_ticket]}, {$_POST[id_usuario]} , {$_POST[id_cargo]}, 
											 {$_POST[nivel_prioridad]}, {$_POST[programada]}, '{$_POST[fecha_programada]}', 
											 '{$_POST[info_adicional]}' , {$strCorrelativo})";

	if ( mysqli_query($con, $strQuery) ) {
	  $lastid=mysqli_insert_id($con);
		foreach ($_FILES as $key => $file) {
			$name = $file['name'];
			$archivo = microtime(true).".".substr(strrchr($name,"."),1);
			$url = "../public/".$archivo;
			
			$strQuery = "INSERT INTO archivos_ticket (id_usuario_ticket , nombre , ruta)
									 VALUES ( {$lastid} , '{$name}' , '{$archivo}' )";

			if ( mysqli_query($con, $strQuery) ) {
				move_uploaded_file($file['tmp_name'] , $url);
			}
		}
		ticket_siguiente_fase($lastid,'',$con);
		notificar_nueva_ticket($lastid, $_POST[id_cargo], $con);	
		//echo json_encode("ok");
	} else {
		$arr['err'] = 'true';
	  echo json_encode($arr);
	}
}

function notificar_nueva_ticket($id_ticket, $id_cargo, $con){

	$strQuery = "SELECT b.nombre_ticket , 
											c.nombre_completo ,
											e.departamento
							FROM usuario_ticket a
							INNER JOIN ticket b ON  a.id_ticket = b.id_ticket
							INNER JOIN usuario c ON a.id_usuario = c.id_usuario
							INNER JOIN departamento_puesto d ON c.id_usuario = d.id_usuario
							INNER JOIN departamento e ON d.id_departamento = e.id_departamento
							WHERE d.id_cargo = {$id_cargo}
							AND a.id_usuario_ticket = {$id_ticket}";
	$exe = mysqli_query($con, $strQuery );
	$row = mysqli_fetch_assoc($exe);
	$datos["nombre_completo"] = $row['nombre_completo'];
	$datos["departamento"] = $row['departamento'];
	$datos["nombre_ticket"] = $row['nombre_ticket'];

	$mensaje = $datos["nombre_ticket"]." - Por: ".$datos["nombre_completo"]." del Dpto. de ".$datos["departamento"].".";

	$strQuery = "SELECT dp.id_usuario , u.email , u.token_web
							 FROM tickets_soporte ts, departamento_puesto dp, departamento d , usuario u
							 WHERE ts.id_cargo = dp.id_cargo 
							 AND dp.id_departamento = d.id_departamento 
							 AND dp.id_usuario = u.id_usuario
							 AND ts.id_ticket = ( SELECT id_ticket 
							 											FROM usuario_ticket 
																		WHERE id_usuario_ticket = {$id_ticket}) 
							 AND d.id_departamento = ( SELECT d.id_departamento 
							  												 FROM departamento_puesto dp, departamento d 
																				 WHERE dp.id_departamento = d.id_departamento 
																				 AND dp.id_cargo = {$id_cargo} LIMIT 1) 
																				 
							UNION
							
							SELECT us.id_usuario, us.email , us.token_web 
							FROM tickets_soporte_global tsg, usuario us 
							WHERE tsg.id_usuario = us.id_usuario 
							AND us.estado = 1 
							AND tsg.id_ticket = ( SELECT id_ticket 
																	  FROM usuario_ticket 
							  										WHERE id_usuario_ticket = {$id_ticket} ) 
							GROUP BY id_usuario";
	$qTmp = mysqli_query($con, $strQuery );
	$index = 0;
	$emails = array();
	while ( $v = mysqli_fetch_object($qTmp) ) {
		if ( !empty($v->token_web) ) {
			sendNotificacionFirebase("Nuevo Ticket" , $mensaje , $v->token_web);
		}		
		$emails[$index] = $v->email;
		$index++;
		$strQuery = "INSERT INTO notificacion(id_usuario, titulo, descripcion, accion, accion_key, estado) 
								 VALUES($v->id_usuario, 'Nueva Ticket en tu Dpto.', '$mensaje' , 'ver_ticket_aceptar', '$id_ticket', 1)";
		mysqli_query($con, $strQuery);
	}	
	
	if ( is_array($emails) &&  sizeof($emails) > 0 ) {
		$arr['emails'] = $emails;
		$arr['mensaje'] = $mensaje;
		$arr['error'] = 'false'; 
		print(json_encode($arr));	
	} 
}

if($_GET[accion]=='get_previsualizar_ticket'){

	//fases
	$strQuery = "SELECT a.id_usuario_ticket , a.id_usuario_ticket_fase , a.id_fase , a.estado , a.fecha_inicio , a.fecha_fin,
											a.id_tecnico , a.resultado , a.calificacion_fase ,
											b.fase , b.orden , b.color , b.tiempo_limite ,
											IF ( a.id_tecnico IS NULL , 'Sin Asignar' ,  c.nombre_completo) AS nombre_completo
								FROM usuario_ticket_fase a 
								INNER JOIN fase b ON a.id_fase = b.id_fase 
								LEFT JOIN usuario c ON a.id_tecnico = c.id_usuario  
								WHERE a.id_usuario_ticket = {$_POST[id_usuario_ticket]}
								GROUP BY a.id_usuario_ticket_fase 
								ORDER BY a.fecha_inicio ASC";
	$qTemp = mysqli_query($con, $strQuery);

	$rows_fases = array();
	while($r = mysqli_fetch_object($qTemp)) {
	    $rows_fases[] = array(
				'id_usuario_ticket_fase'=>($r->id_usuario_ticket_fase),
				'id_fase'=>($r->id_fase),
				'estado'=>($r->estado),
				'fecha_inicio'=>($r->fecha_inicio),
				'fecha_fin'=>($r->fecha_fin),
				'id_tecnico'=>($r->id_tecnico),
				'nombre_tecnico'=>($r->nombre_completo),
				'resultado'=>($r->resultado),
				'calificacion_fase'=>($r->calificacion_fase),
				'fase'=>($r->fase),
				'orden'=>($r->orden),
				'tiempo_limite'=>($r->tiempo_limite),
				'color'=>($r->color)
			);
	}
	$fases_tickets= json_encode($rows_fases);

	//mensajes
	$strQuery = "SELECT men.id_mensaje, men.id_usuario, us.nombre_completo, men.mensaje, men.fecha, men.estado 
							 FROM usuario_ticket ut, mensaje men, usuario us 
							 WHERE ut.id_usuario_ticket=men.id_usuario_ticket 
							 AND men.id_usuario=us.id_usuario 
							 AND ut.id_usuario_ticket={$_POST[id_usuario_ticket]} 
							 ORDER BY men.fecha ASC";
	$mensajes = mysqli_query($con, $strQuery);
	$rows_mensajes = array();
	while($r = mysqli_fetch_object($mensajes)) {
		$rows_mensajes[] = array(
			'id_mensaje'=>($r->id_mensaje),
			'id_usuario'=>($r->id_usuario),
			'nombre_completo'=>($r->nombre_completo),
			'mensaje'=>($r->mensaje),
			'fecha'=>($r->fecha),
			'estado'=>($r->estado),
		);
	}

	$mensajes_ticket= json_encode($rows_mensajes);
	
	$strQuery =  "SELECT c.categoria, sb.sub_categoria, t.nombre_ticket, t.procedimiento, t.descripcion, 
											 ut.id_usuario_ticket, ut.nivel_prioridad, ut.creacion, ut.programada, 
											 ut.fecha_programada, ut.info_adicional, ut.estado, ut.id_calificacion, 
											 us.username, us.username, us.nombre_completo , us.id_usuario , d.departamento, p.puesto  
								FROM categoria c, sub_categoria sb, ticket t, usuario_ticket ut, usuario us,
									   departamento_puesto dp, puesto p, departamento d 
								WHERE c.id_categoria=sb.id_categoria 
								AND sb.id_sub_categoria=t.id_sub_categoria 
								AND t.id_ticket=ut.id_ticket 
								AND ut.id_usuario=us.id_usuario 
								AND us.id_usuario=dp.id_usuario 
								AND dp.id_departamento=d.id_departamento 
								AND dp.id_puesto=p.id_puesto 
								AND ut.id_usuario_ticket={$_POST[id_usuario_ticket]} 
								GROUP BY t.id_ticket LIMIT 1";
	$sql = mysqli_query($con, $strQuery);
	$row = mysqli_fetch_object($sql);

	$strQuery = "SELECT ruta , nombre
							 FROM archivos_ticket 
							 WHERE id_usuario_ticket ={$_POST[id_usuario_ticket]}";
	$qTmp = mysqli_query($con, $strQuery);
	$arr = array();
	while($rTmp = mysqli_fetch_object($qTmp)) {
		$arr[] = array(
			'nombre' => ($rTmp->nombre) ,
			'ruta' => ($rTmp->ruta) ,	
		);	
	}	

	$jsondata['categoria'] = $row->categoria;
	$jsondata['sub_categoria'] = $row->sub_categoria;
	$jsondata['nombre_ticket'] = $row->nombre_ticket;
	$jsondata['procedimiento'] = $row->procedimiento;
	$jsondata['descripcion'] = $row->descripcion;
	$jsondata['id_usuario_ticket'] = $row->id_usuario_ticket;
	$jsondata['nivel_prioridad'] = $row->nivel_prioridad;
	$jsondata['creacion'] = $row->creacion;
	$jsondata['programada'] = $row->programada;
	$jsondata['fecha_programada'] = $row->fecha_programada;
	$jsondata['info_adicional'] = $row->info_adicional;
	$jsondata['username'] = $row->username;
	$jsondata['nombre_completo'] = $row->nombre_completo;
	$jsondata['departamento'] = $row->departamento;
	$jsondata['puesto'] = $row->puesto;
	$jsondata['estado'] = $row->estado;
	$jsondata['id_calificacion'] = $row->id_calificacion;
	$jsondata['calificacion'] = (json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM calificacion_ticket WHERE id_calificacion=$row->id_calificacion "))) );
	$jsondata['fases'] = $fases_tickets;
	$jsondata['mensajes'] = $mensajes_ticket;
	$jsondata['archivos'] = $arr;
	$jsondata['id_usuario'] = $row->id_usuario;

	echo json_encode($jsondata);
}



if($_GET[accion]=='tomar_ticket'){
	ticket_siguiente_fase($_POST[id_usuario_ticket], $_POST[id_tecnico], $con);
	//borramos peticiones sobre ticket
	mysqli_query($con, "DELETE FROM notificacion 
											WHERE accion_key='$_POST[id_usuario_ticket]' 
											AND accion='ver_ticket_aceptar'" );
}

function ticket_siguiente_fase ( $id_usuario_ticket , $id_tecnico, $con ) {

	$exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW 
	 													 FROM usuario_ticket_fase utf 
														 WHERE utf.id_usuario_ticket = {$id_usuario_ticket}");
	$row = mysqli_fetch_assoc($exe);
	$fases = $row['NUMBER_ROW'];

	if ( intval($fases) == 0 ) {
	 	mysqli_query($con, "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase ) 
		 										VALUES( {$id_usuario_ticket} , ( SELECT id_fase 
												 																 FROM fase 
																												 ORDER BY orden 
																												 ASC LIMIT 1) )" );
	} else {
	 	$fase_siguiente = intval($fases) + 1;
	 	//total fases
	 	$exeb = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM fase WHERE estado = 1");
		$rowb = mysqli_fetch_assoc($exeb);
		$total_fases = $rowb['NUMBER_ROW'];

		//actualizamos ultima insertada
		//total fases
	 	$ultima = mysqli_query($con, "SELECT utf.id_usuario_ticket_fase, utf.id_tecnico 
		 															FROM usuario_ticket_fase utf 
																	WHERE utf.id_usuario_ticket=$id_usuario_ticket 
																	ORDER BY utf.fecha_inicio DESC LIMIT 1");
		$rowultima = mysqli_fetch_assoc($ultima);
		$id_usuario_ticket_fase = $rowultima['id_usuario_ticket_fase'];
	 	mysqli_query($con, "UPDATE usuario_ticket_fase 
		 										SET fecha_fin = current_timestamp() , 
												 		estado = 1 
												WHERE id_usuario_ticket_fase = {$id_usuario_ticket_fase}");

	 	$limitar = $fase_siguiente-1;

		if(intval($fase_siguiente) < intval($total_fases)){
			////////////////////////////////////////
			//ultimo técnico o ninguno
			$id_ultimo_tecnico = intval($rowultima['id_tecnico']);
			//ha pasado a la siguiente fase con el mismo tencico
			$exe_t = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario=$id_tecnico");
		 	$row_t = mysqli_fetch_assoc($exe_t);
		 	$nombre_tecnico = $row_t['nombre_completo'];
		 	$mensaje="";

			if ( $id_ultimo_tecnico != 0 ) {
		 		if ( intval($id_ultimo_tecnico) == intval($id_tecnico) ) {
		 			//insertamos fase siguiente
					mysqli_query($con, "INSERT INTO usuario_ticket_fase ( id_usuario_ticket , id_fase, id_tecnico ) 
															VALUES( {$id_usuario_ticket} , ( SELECT id_fase 
																															 FROM fase 
																															 ORDER BY orden 
																															 ASC LIMIT $limitar, 1) , 
																		  {$id_tecnico} )" );
		 			$mensaje="Tu ticket ha cambiado de estado!";
		 		} else {
					print("ha habido un cambio de técnico");
					//ha pasado a la siguiente fase con el mismo tencico
					$exe_t2 = mysqli_query($con, " SELECT nombre_completo FROM usuario WHERE id_usuario = $id_tecnico ");
					$row_t2 = mysqli_fetch_assoc($exe_t2);
					$nombre_tecnico2 = $row_t2['nombre_completo'];
					$mensaje=$nombre_tecnico." no ha podido continuar atendiendo tu ticket, pero ".$nombre_tecnico2." se hará cargo de ella a partir de ahora.";

					//enviamos notificacion
					//$mensaje_2 = $nombre_tecnico2." ha tomado tu ticket.";
					//mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) 
															//VALUES('$id_tecnico', 'Ticket Aceptada!', '$mensaje_2', '$fecha', 'ver_ticket_all', '$id_usuario_ticket', 1)" );
				}
			} else {
				//insertamos fase siguiente
				mysqli_query($con, "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase , id_tecnico) 
														VALUES($id_usuario_ticket, ( SELECT id_fase 
																												 FROM fase 
																												 ORDER BY orden 
																												 ASC LIMIT $limitar, 1), $id_tecnico)" );
				$mensaje=$nombre_tecnico." ha tomado tu ticket, muy pronto le estará dando solución!";
			}
			mysqli_query($con, "UPDATE usuario_ticket 
													SET id_tecnico = {$id_tecnico} 
													WHERE id_usuario_ticket = {$id_usuario_ticket}");
		} else {
			//damos por finalizada ticket
			mysqli_query($con, "UPDATE usuario_ticket 
													SET estado=1, id_tecnico = $id_tecnico , 
															fecha_fin = current_timestamp()
													WHERE id_usuario_ticket = {$id_usuario_ticket}");
			$mensaje="Ticket dada por finalizada.";
		}
		
		//enviamos notificacion
		mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) 
												VALUES((SELECT id_usuario FROM usuario_ticket WHERE id_usuario_ticket=$id_usuario_ticket), 'Ticket Actualizada!', '$mensaje', '$fecha', 'ver_ticket', '$id_usuario_ticket', 1)" );
		$strQuery = "SELECT b.id_departamento , b.id_puesto ,
											c.email , c.token_web
								 FROM usuario_ticket a 
								 INNER JOIN departamento_puesto b ON a.id_cargo = b.id_cargo
								 INNER JOIN usuario c ON a.id_usuario = c.id_usuario
								 WHERE a.id_usuario_ticket = {$id_usuario_ticket}";

		$qTmp = mysqli_query($con , $strQuery);
		$rTmp = mysqli_fetch_assoc($qTmp);		
		if ( !empty($rTmp['token_web']) ) {
			sendNotificacionFirebase("Nuevo estado de Ticket" , $mensaje , $rTmp['token_web']);
		}

		$arr["para"] =  $rTmp['email'];
		$arr["mensaje"] =  $mensaje;
		if ( $rTmp['id_puesto'] != 3 ) {
			$strQuery = "SELECT b.email
										FROM departamento_puesto a
										INNER JOIN usuario b ON a.id_usuario = b.id_usuario
										WHERE a.id_puesto = 3
										AND a.id_departamento = {$rTmp->id_departamento}";
			$qTmp = mysqli_query($con , $strQuery);
			$index = 0;
			while ( $rTmp = mysqli_fetch_array($qTmp) ) {
				$arr["copia"][$index] = $rTmp['email'];
				$index++;
			}		
		}		
		print(json_encode($arr));
	}
}


function transferir_ticket($id_usuario_ticket, $id_nuevo_tecnico, $con){

	//notificamos lo mismo 
	$mensaje=$nombre_tecnico." ha tomado tu ticket, muy pronto le estará dando solución!";


}

if ( $_GET[accion] == 'puntuar_fase' ){

	$sql = mysqli_query( $con, "UPDATE usuario_ticket_fase 
															SET calificacion_fase = '$_POST[calificacion_fase]' 
															WHERE id_usuario_ticket_fase = '$_POST[id_usuario_ticket_fase]'" );

	if ( $sql ) { 
	  echo json_encode("Ok");
	} else {
	  echo json_encode("error");
	}
}

if ( $_GET[accion] == 'put_mensaje' ) {
	$intIdUsuario = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;	
	$intIdUsuarioTicket = isset($_POST['id_usuario_ticket']) ? intval($_POST['id_usuario_ticket']) : 0;
	$strMensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : null;

	$strQuery = "INSERT INTO mensaje (id_usuario , id_usuario_ticket , mensaje ) 
							 VALUES( {$intIdUsuario} , {$intIdUsuarioTicket} , '{$strMensaje}' )";
	if ( mysqli_query($con, $strQuery ) ){
		$strQuery = "SELECT a.id_usuario ,
												b.username AS usuario , b.token_web AS tocken_usuario ,
        								c.username AS tecnico , c.token_web AS tocken_tecnico
								FROM usuario_ticket a
								INNER JOIN usuario b ON a.id_usuario = b.id_usuario
								LEFT JOIN usuario c ON a.id_tecnico = c.id_usuario 
								WHERE a.id_usuario_ticket = {$intIdUsuarioTicket}";
		$qTmp = mysqli_query($con , $strQuery);
		$rTmp = mysqli_fetch_assoc($qTmp);
		$strToken = ($rTmp["id_usuario"] == $intIdUsuario) ?  $rTmp["tocken_tecnico"] : $rTmp["tocken_usuario"];
		$strDe = ($rTmp["id_usuario"] == $intIdUsuario) ?  $rTmp["usuario"] : $rTmp["tecnico"];
		$strUrl = "/inicio?".$intIdUsuarioTicket;

		if ( !empty($strToken) ) {
			sendNotificacionFirebase("Nuevo mensaje de: {$strDe} " , $strMensaje , $strToken , $strUrl );
		}
	  echo json_encode("Ok");
	} else {
	  echo json_encode("error");
	}
}


if( $_GET[accion] == 'siguiente_fase' ) {
	ticket_siguiente_fase($_POST[id_usuario_ticket], $_POST[id_usuario], $con);
	//echo json_encode("Ok");
}


if($_GET[accion]=='puntuar_ticket'){

	$sql = mysqli_query($con, "INSERT INTO calificacion_ticket(nivel_satisfaccion, tiempo_espera, amabilidad, conocimientos) VALUES('$_POST[nivel_satisfaccion]', '$_POST[tiempo_espera]', '$_POST[amabilidad]', '$_POST[conocimientos]')" );

	if($sql){
	 	
	 	$lastid=mysqli_insert_id($con);

	  	$sqls = mysqli_query($con, "UPDATE usuario_ticket SET id_calificacion='$lastid' WHERE id_usuario_ticket='$_POST[id_usuario_ticket]'" );

		if($sqls){
		  echo json_encode("Ok");
		}else{
		  echo json_encode("error");
		}


	}else{
	  echo json_encode("error");
	}


	
}

if($_GET[accion]=='get_soporte_compatible'){

	$sql = mysqli_query($con, "SELECT dp.id_usuario, us.nombre_completo FROM tickets_soporte ts, departamento_puesto dp, departamento d, usuario us WHERE ts.id_cargo=dp.id_cargo AND dp.id_departamento=d.id_departamento AND dp.id_usuario=us.id_usuario AND us.estado=1 AND ts.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket='$_POST[id_usuario_ticket]') AND d.id_departamento=(SELECT d.id_departamento FROM usuario_ticket ut, usuario us, departamento_puesto dp WHERE ut.id_usuario=us.id_usuario AND  us.id_usuario=dp.id_usuario AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' LIMIT 1) GROUP BY id_usuario ");

	$resultado = array();
	while($r = mysqli_fetch_object($sql)) {
	    $resultado[] = array(
	               'id_usuario'=>($r->id_usuario),
	               'nombre_completo'=>($r->nombre_completo),

	              );
	}


	$sql_global= mysqli_query($con, "SELECT us.id_usuario, us.nombre_completo FROM tickets_soporte_global tsg, usuario us WHERE tsg.id_usuario=us.id_usuario AND us.estado=1 AND  tsg.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket='$_POST[id_usuario_ticket]') GROUP BY id_usuario ");

	while($r_global = mysqli_fetch_object($sql_global)) {
	    $resultado[] = array(
	               'id_usuario'=>($r_global->id_usuario),
	               'nombre_completo'=>($r_global->nombre_completo.' - Soporte Global'),
	              );
	}

	echo json_encode($resultado);

	
}


if ( $_GET[accion] == 'enviar_ticket_transferida') {
	//datos tecnico
	$strQuery = "SELECT nombre_completob
							 FROM usuario 
							 WHERE id_usuario='$_POST[id_tecnico]' ";
	$exe = mysqli_query($con , $strQuery );
 	$row = mysqli_fetch_assoc($exe);
 	$nombre_tecnico = $row['nombre_completo'];

 	$titulo= $nombre_tecnico." te ha transferido una ticket";
 	$mensaje= "Nueva asignación de tickte. Podrías darle continuidad?";
 
	 //enviamos notificacion
	$strQuery = "INSERT INTO notificacion(id_usuario, titulo, descripcion, accion, accion_key, estado) 
						   VALUES('$_POST[id_usuario]', '$titulo', '$mensaje', 'ver_ticket_aceptar_transferida', '$_POST[id_usuario_ticket]', 1)";
	$sqls = mysqli_query($con, $strQuery );

	$strQuery = "SELECT email , token_web 
							 FROM usuario 
							 WHERE id_usuario = {$_POST[id_usuario]}";
	$qTmp = mysqli_query($con , $strQuery);
	$rTmp = mysqli_fetch_assoc($qTmp);

	if ( !empty($rTmp['token_web'] ) ) {
		sendNotificacionFirebase($titulo , $mensaje , $rTmp['token_web']);
	}

	if ( !empty($rTmp['email'] ) ) {
		$arr["para"] =  $rTmp['email'];
		$arr["mensaje"] =  $mensaje;

		curl_setopt($ch, CURLOPT_URL,"../mail.php?accion=set");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS,  $arr); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$server_output = curl_exec ($ch);
		curl_close ($ch);
	}
	
	if($sqls){
	  echo json_encode("ok");
	}else{
	  echo json_encode("error");
	}	
}

if($_GET[accion]=='no_tomar_ticket'){
	//datos tecnico
	$exe = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario={$_POST[id_tecnico]} ");
 	$row = mysqli_fetch_assoc($exe);
 	$nombre_tecnico = $row['nombre_completo'];

 	$titulo= $nombre_tecnico." ha rechazado tu ticket";
 	$mensaje= "Por algún motivo ".$nombre_tecnico." no ha podido tomar tu ticket.";

	 //enviamos notificacion
	 $strQuery = "INSERT INTO notificacion(id_usuario, titulo, descripcion, accion, accion_key, estado) 
	 							VALUES((SELECT utf.id_tecnico 
								 				FROM usuario_ticket ut, usuario_ticket_fase utf 
												WHERE  ut.id_usuario_ticket=utf.id_usuario_ticket 
												AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' 
												ORDER BY utf.fecha_inicio DESC LIMIT 1) ,
								      '$titulo', '$mensaje', 'ver_ticket_all', '$_POST[id_usuario_ticket]', 1)";
	$sql = mysqli_query($con, $strQuery );
	if ( $sql ) {
	  echo json_encode("Ok");
	} else {
	  echo json_encode("error");
	}
}

mysqli_close($con);

?>