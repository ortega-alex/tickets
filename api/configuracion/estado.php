<?php


function estado_asignacion($id_cargo, $con){

	//Usuario general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario us, departamento_puesto dp WHERE us.id_usuario=dp.id_usuario AND dp.id_cargo=$id_cargo AND us.estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $usuario = $row['NUMBER_ROW'];


	//Departamento general
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento d, departamento_puesto dp WHERE dp.id_departamento=d.id_departamento AND dp.id_cargo=$id_cargo AND d.estado=0");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $departamento = $row2['NUMBER_ROW'];


	//Puesto General.
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_puesto=p.id_puesto AND dp.id_cargo=$id_cargo AND p.estado=0");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $puesto_general = $row33['NUMBER_ROW'];


	//Asignación.
	 $exe3 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_cargo=$id_cargo AND estado=0");
	 $row3 = mysqli_fetch_assoc($exe3);
	 $asignacion = $row3['NUMBER_ROW'];


	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if(intval($usuario)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Usuario Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($departamento)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Departamento Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($puesto_general)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Puesto Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($asignacion)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignación Desactivada';
	 	$jsondata['directo'] = 'Si';

	 }

	 return json_encode($jsondata);


}




function estado_puestoDpto($id_puesto, $id_departamento, $con){

	//Departamento general
	 $exe0 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento WHERE id_departamento=$id_departamento AND estado=0");
	 $row0 = mysqli_fetch_assoc($exe0);
	 $departamento = $row0['NUMBER_ROW'];

	//Puesto General.
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_puesto=p.id_puesto AND dp.id_puesto=$id_puesto AND dp.id_departamento=$id_departamento AND p.estado=0");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $puesto_general = $row33['NUMBER_ROW'];


	 //Puesto Dpto Activos.
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_puesto=$id_puesto AND id_departamento=$id_departamento AND estado=1");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $puestos_activos_dpto = $row2['NUMBER_ROW'];

	 //Puesto Dpto Inactivos.
	 $exe3 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_puesto=$id_puesto AND id_departamento=$id_departamento AND estado=0");
	 $row3 = mysqli_fetch_assoc($exe3);
	 $puestos_inactivos_dpto = $row3['NUMBER_ROW'];



	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	 //EVALUAMOS
	 if(intval($puesto_general)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Puesto Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($puestos_activos_dpto)==0 && intval($puestos_inactivos_dpto)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignaciones Inactivas';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($puestos_activos_dpto)==0 && intval($puestos_inactivos_dpto)==0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Asignaciones';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($departamento)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Departamento Desactivado';
	 	$jsondata['directo'] = 'No';

	 }


	 return json_encode($jsondata);


}


function estado_departamento($id_departamento, $con){

	//Departamento general
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento WHERE id_departamento=$id_departamento AND estado=0");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $departamento = $row2['NUMBER_ROW'];


	//Asignaciones Activas
	 $exe3 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_departamento=$id_departamento AND dp.id_puesto=p.id_puesto AND p.estado=1 AND dp.estado=1");
	 $row3 = mysqli_fetch_assoc($exe3);
	 $asignaciones_activas = $row3['NUMBER_ROW'];

	//Asignaciones Inactivas
	 $exe4 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_departamento=$id_departamento AND dp.id_puesto=p.id_puesto AND p.estado=1 AND dp.estado=0");
	 $row4 = mysqli_fetch_assoc($exe4);
	 $asignaciones_inactivas = $row4['NUMBER_ROW'];




	 //EVALUAMOS

	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';


	//puestos generales que tenga el dpto inactivos
	$sql66 = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_departamento=$id_departamento GROUP BY id_puesto");
	$disparador_puestos_generales=true;
	$contador=0;
	while($v = mysqli_fetch_object($sql66)){

		 $contador++;

		 //Puesto Dpto Activos.
		 $e1 = mysqli_query($con, "SELECT * FROM puesto WHERE id_puesto=$v->id_puesto");
		 $r1 = mysqli_fetch_assoc($e1);
		 $puestos_inactivos_dpto_ = $r1['estado'];

		 if(intval($r1['estado'])==1){
		 	$disparador_puestos_generales=false;
		 }

		 //Puesto Dpto Activos.
		/* $e2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM puesto WHERE id_puesto=$v->id_puesto AND estado=1");
		 $r2 = mysqli_fetch_assoc($e2);
		 $puestos_activos_dpto_ = $r2['NUMBER_ROW']; */


		/* if (intval($puestos_inactivos_dpto_)>0) {
		 	
		 	$disparador_puestos_generales=true;

		 }*/

	}

	if($contador==0){
		$disparador_puestos_generales=false;
	}


	 if(intval($departamento)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Departamento Desactivado';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($asignaciones_activas)==0 && intval($asignaciones_inactivas)>0 && $disparador_puestos_generales==false) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignaciones Inactivas';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($asignaciones_activas)==0 && intval($asignaciones_inactivas)==0 && $disparador_puestos_generales==false) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Asignaciones';
	 	$jsondata['directo'] = 'No';

	 }elseif ($disparador_puestos_generales==true) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Todos sus Puestos Desactivados';
	 	$jsondata['directo'] = 'No';

	 }


	 return json_encode($jsondata);

}


function estado_puesto_general($id_puesto, $con){

	//Puesto general
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM puesto WHERE id_puesto=$id_puesto AND estado=0");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $puesto_general = $row2['NUMBER_ROW'];


	//Asignaciones Activas
	 $exe3 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_puesto=p.id_puesto AND dp.estado=1");
	 $row3 = mysqli_fetch_assoc($exe3);
	 $asignaciones_activas = $row3['NUMBER_ROW'];


	//Asignaciones Inactivas
	 $exe4 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_puesto=p.id_puesto AND dp.estado=0");
	 $row4 = mysqli_fetch_assoc($exe4);
	 $asignaciones_inactivas = $row4['NUMBER_ROW'];



	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	 //EVALUAMOS
	 if(intval($puesto_general)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Puesto Desactivado';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($asignaciones_activas)==0 && intval($asignaciones_inactivas)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignaciones Inactivas';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($asignaciones_activas)==0 && intval($asignaciones_inactivas)==0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Asignaciones';
	 	$jsondata['directo'] = 'No';

	 }


	 return json_encode($jsondata);

}



?>
