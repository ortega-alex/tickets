<?php

function estado_usuario($id_usuario, $con){

	//Usuario general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario WHERE id_usuario=$id_usuario AND estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $usuario = $row['NUMBER_ROW'];

	//Usuario asignacionesestado_usuario
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_usuario=$id_usuario");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $usuario_asignaciones = $row2['NUMBER_ROW'];

	//Usuario asignaciones inactivas
	 $exe3 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_usuario=$id_usuario AND estado=0");
	 $row3 = mysqli_fetch_assoc($exe3);
	 $usuario_asignaciones_inactivas = $row3['NUMBER_ROW'];


	//Usuario asignaciones inactivas
	 $exe3b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_usuario=$id_usuario AND estado=1");
	 $row3b = mysqli_fetch_assoc($exe3b);
	 $usuario_asignaciones_activas = $row3b['NUMBER_ROW'];


	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	 //EVALUAMOS
	 if(intval($usuario)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Usuario Desactivado';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($usuario_asignaciones)==0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin asignar';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($usuario_asignaciones_activas)==0 && intval($usuario_asignaciones_inactivas)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignaciones Inactivas';
	 	$jsondata['directo'] = 'No';

	 }

	 return json_encode($jsondata);

}




?>
