<?php


function estado_puesto($id_puesto, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM puesto WHERE id_puesto=$id_puesto AND estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $puesto = $row['NUMBER_ROW'];


	//tickets inactivas
	 $exe2b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM perfil_tickets pt, puesto p WHERE pt.id_puesto=p.id_puesto AND p.id_puesto=$id_puesto");
	 $row2b = mysqli_fetch_assoc($exe2b);
	 $tickets_ = $row2b['NUMBER_ROW'];




	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if (intval($puesto)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Puesto Desactivado';
	 	$jsondata['directo'] = 'Si';

	 }elseif(intval($tickets_)==0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Perfil de Tickets';
	 	$jsondata['directo'] = 'No';

	 }


	 return json_encode($jsondata);


}





?>
