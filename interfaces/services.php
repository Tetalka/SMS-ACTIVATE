<?php 
    require_once '../library/services.php';
    require_once 'users.php';

    $input = json_decode(file_get_contents('PHP://input'), true);
    $admin = $_COOKIE['Login'] && getUserRole($_COOKIE['Login']) == 'Admin';
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        if($_GET['Country']) {
            $services = getServices(['Service', 'Price', 'Amount'], $_GET['Country']);
            echo json_encode($services->fetch_all(MYSQLI_ASSOC));
        }
        else if($_GET['History']) {
            if (!$admin) {
                http_response_code(403);
                return;
            }
            $services = getHistory();
            echo json_encode($services->fetch_all(MYSQLI_ASSOC));
        }
        else {
            $services = getAllServices(['Name', 'Amount']);
            echo json_encode($services->fetch_all(MYSQLI_ASSOC));
        }
    }
    else if(!$admin) {
        http_response_code(403);
        return;
    }
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $discarded = array();
        if ($input['Country']) {
            foreach ($input['data'] as $value) {
                if(!addCountryService($input['Country'], $value['Name'], $value['Price'])) array_push($discarded, $value['Name']);
            }
        }
        else {
            foreach ($input['data'] as $value) {
                if(!addService($value['Name'], $value['Amount'])) array_push($discarded, $value['Name']);
            }
        }
        sendDiscarded($discarded);
    }
    if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
        $discarded = array();
        if ($input['Country']) {
            foreach ($input['data'] as $value) {
                if(!updateCountryService($value['Price'], $input['Country'], $value['Name'])) array_push($discarded, $value['Name']);
            }
        }
        else {
            foreach ($input['data'] as $value) {
                if(!updateService($value['Name'], $value['Amount'])) array_push($discarded, $value['Name']);
            }
        }
        sendDiscarded($discarded);
    }
    if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
        $discarded = array();
        if ($input['Country']) {
            foreach ($input['data'] as $value) {
                if(!deleteCountryService($input['Country'], $value)) array_push($discarded, $value['Name']);
            }
        }
        else {
            foreach ($input['data'] as $value) {
                if(!deleteService($value)) array_push($discarded, $value);
            }
        }
        sendDiscarded($discarded);
    }
?>