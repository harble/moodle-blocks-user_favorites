<?php
require_once('../../config.php');
require_login();
$context = context_system::instance();
require_capability('moodle/site:config', $context);

echo '<pre>';

global $DB;
$pagetypes = ['mod-hsuforum-view', 'mod-hsuforum-discuss'];

foreach ($pagetypes as $pagetype) {
    $all = $DB->get_records('block_instances', [
        'blockname' => 'user_favorites',
        'pagetypepattern' => $pagetype,
    ], 'id ASC');

    $system = [];
    $others = [];
    foreach ($all as $inst) {
        if ($inst->parentcontextid == $context->id) {
            $system[] = $inst;
        } else {
            $others[] = $inst;
        }
    }

    $keepId = null;

    if (count($system) > 0) {
        $keepId = reset($system)->id;
        $extra = array_slice($system, 1);
        foreach ($extra as $inst) {
            $DB->delete_records('block_positions', ['blockinstanceid' => $inst->id]);
            $DB->delete_records('block_instances', ['id' => $inst->id]);
        }
    } else {
        $block = new stdClass();
        $block->blockname = 'user_favorites';
        $block->parentcontextid = $context->id;
        $block->showinsubcontexts = 0;
        $block->pagetypepattern = $pagetype;
        $block->subpagepattern = null;
        $block->defaultregion = 'side-pre';
        $block->defaultweight = 0;
        $block->visible = 1;
        $block->configdata = null;
        $block->timecreated = time();
        $block->timemodified = time();

        $keepId = $DB->insert_record('block_instances', $block);
    }

    $deleted = 0;
    foreach ($others as $inst) {
        $DB->delete_records('block_positions', ['blockinstanceid' => $inst->id]);
        $DB->delete_records('block_instances', ['id' => $inst->id]);
        $deleted++;
    }

    $total = count($all);
    echo '[' . $pagetype . '] Total: ' . $total . ', kept: ' . $keepId . ', removed: ' . ($total - 1) . PHP_EOL;
}

echo PHP_EOL . 'Clear Moodle cache.';
echo '</pre>';