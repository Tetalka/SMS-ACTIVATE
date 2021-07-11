<?php 
    require_once 'db.php';

    function addCountry($name) {
        global $db;
        return $db->execute($db->prepare('INSERT INTO countries VALUES (?)'), ['s', $name]);
    }
    function updateCountry($newName, $previousName) {
        global $db;
        return $db->execute($db->prepare('UPDATE countries SET Name = ? WHERE Name = ?'), ['ss', $newName, $previousName]);
    }
    function deleteCountry($name) {
        global $db;
        return $db->execute($db->prepare('DELETE FROM countries WHERE Name = ?'), ['s', $name]);
    }
?>