# Changelog

All notable changes to this project will be documented in this file.

## 5.1.0 (2026032100)
- Tested and verified on Moodle 5.1
- Updated supported version range to Moodle 4.2 - 5.1
- Updated README to uniform LdesignMedia format
- Added SECURITY.md

## 5.0.0 (2025072900)
- Tested and refactored for Moodle (LMS) 5.0

## 4.4.1 (2024061800)
- Improve styling by SnakyJake ([#35](https://github.com/Lesterhuis-Training-en-Consultancy/moodle-block-user_favorites/pull/35))

## 4.4.0 (2024040500)
- Tested for Moodle (LMS) 4.4 and PHP 8.1

## 4.3.0 (2024021600)
- Tested and refactored for Moodle (LMS) 4.3

## 4.2.0 (2023122000)
- Branche 4.2 for just 4.2 use
- Validation M4.2

## 4.1.3 (2023122000)
- Fix incorrect security risk flags on the capabilities
- Fix issue moving favorites ([#23](https://github.com/Lesterhuis-Training-en-Consultancy/moodle-block-user_favorites/issues/23))

## 4.1.2 (2023050900)
- Fix Block drawer breaks in Moodle 4.1 ([#16](https://github.com/Lesterhuis-Training-en-Consultancy/moodle-block-user_favorites/issues/16)) - thanks to @stopfstedt

## 4.1.1 (2023030200)
- Move externallib.php to namespaced external API
- Functionality to sort the user favorites using AJAX requests
- Allow user to mark a page with # as favorite

## 3.10.1 (2020111400)
- Updated version number, no issues found
- Removed `.eslintrc`, `Gruntfile.js` and `packages.json` (caused Travis issues)

## 3.9.1 (2020071200)
- Fix external API nested Optional url (thanks @ewallah)

## 3.9.0 (2020050600)
- Updated version number, no issues found
- Minimum version PHP 7.2

## 3.8.0 (2019103000)
- Updated version number, no issues found

## 3.7.2 (2019091700)
- Saving user favourites to a separate table ([#3](https://github.com/MFreakNL/moodle-block-user_favorites/issues/3))
- Upgrade script `user_preference` -> `block_user_favorites` using a separate table
- Implement privacy provider for the new table

## 3.5.3 (2019052000)
- Release of the first official stable version
