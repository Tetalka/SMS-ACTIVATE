<?php 
    require_once 'db.php';

    function getServices ($columns, $country = null) {
        global $db;
        if(is_array($columns)) $columns = implode(', ', $columns);
        $query = "SELECT {$columns} FROM `country-services` JOIN services ON Service = Name";
        if ($country) $query .= " WHERE Country = '{$country}'";
        $services = $db->makeQuery($query);
        return $services;
    }
    function getAllServices ($columns) {
        global $db;
        if(is_array($columns)) $columns = implode(', ', $columns);
        $query = "SELECT {$columns} FROM services";
        $services = $db->makeQuery($query);
        return $services;
    }
    function getHistory() {
        global $db;
        return $db->makeQuery('SELECT Country, Service, Price, Date FROM serviceshistory');
    }
    function addCountryService($country, $name, $price) {
        global $db;
        return $db->execute($db->prepare('INSERT INTO `country-services` (Country, Service, Price) VALUES (?, ?, ?)'), ['ssi', $country, $name, $price]);
    }
    function addService($name, $amount) {
        global $db;
        return $db->execute($db->prepare('INSERT INTO services VALUES (?, ?)'), ['si', $name, $amount]);
    }
    function updateCountryService($price, $country, $service) {
        global $db;
        return $db->execute($db->prepare('UPDATE `country-services` SET Price = ? WHERE Country = ? AND Service = ?'), ['iss', $price, $country, $service]);
    }
    function updateService($name, $amount) {
        global $db;
        return $db->execute($db->prepare('UPDATE `services` SET Name = ?, Amount = ? WHERE Name = ?'), ['sis', $name, $amount, $name]);
    }
    function deleteCountryService($country, $service) {
        global $db;
        return $db->execute($db->prepare('DELETE FROM `country-services` WHERE Country = ? AND Service = ?'), ['ss', $country, $service]);
    }
    function deleteService($name) {
        global $db;
        return $db->execute($db->prepare('DELETE FROM services WHERE Name = ?'), ['s', $name]);
    }
?>