<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Form for editing user_favorites block instances.
 *
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 * @package   block_user_favorites
 * @copyright 2024
 * @author    Luuk Verhoeven
 **/

class block_user_favorites_edit_form extends block_edit_form {

    protected function specific_definition($mform) {
        $mform->addElement('header', 'configheader', get_string('blocksettings', 'block'));

        $mform->addElement('text', 'config_title', get_string('configtitle', 'block_user_favorites'));
        $mform->setType('config_title', PARAM_TEXT);

        $perpageoptions = [
            4 => '4',
            6 => '6',
            8 => '8',
            10 => '10',
            12 => '12',
            16 => '16',
            20 => '20',
        ];
        $mform->addElement('select', 'config_perpage',
            get_string('config:perpage', 'block_user_favorites'), $perpageoptions);
        $mform->setDefault('config_perpage', 8);
        $mform->setType('config_perpage', PARAM_INT);
    }

    public static function display_form_when_adding(): bool {
        return true;
    }
}