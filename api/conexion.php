<?php
function conexion()
{
	/*$host='172.29.11.26';
	$user='mduarte';
   $pass='Duarte!M2018';
   $db='oca_tickets';*/

   $host='172.29.11.26';
	$user='mortega';
   $pass='20!Ortega19';
   $db='oca_tickets';
   
   /*$host='127.0.0.1';
	$user='root';
   $pass='';
   $db='oca_tickets';*/

   //if (!($con=mysqli_connect("172.29.11.26","mduarte","Duarte!M2018", "m2guate")))
   if (!($con=mysqli_connect($host,$user,$pass, $db)))
   {
      echo "Error conectando a la base de datos.";
      exit();
   }

   return $con;
}

?>
