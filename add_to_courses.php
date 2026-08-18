<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../../config.php');

echo '<pre style="font-family: monospace; background: #f5f5f5; padding: 15px; border: 1px solid #ccc;">';

try {
    require_login();

    if (!is_siteadmin()) {
        echo '<strong style="color:red;">权限不足，仅管理员可执行此脚本</strong>';
        echo '</pre>';
        exit;
    }

    global $DB;

    echo '开始批量添加收藏block到课程...<hr>';

    $courses = $DB->get_records('course');
    $count = 0;
    $skip = 0;
    $error = 0;

    if (empty($courses)) {
        echo '<strong style="color:orange;">警告: 未找到任何课程</strong><br>';
    }

    foreach ($courses as $course) {
        try {
            if ($course->id == 1) {
                $skip++;
                continue;
            }

            $context = context_course::instance($course->id);

            $existing = $DB->get_record('block_instances', [
                'blockname' => 'user_favorites',
                'parentcontextid' => $context->id,
                'pagetypepattern' => 'course-view-*'
            ]);

            if (!$existing) {
                $blockinstance = new stdClass();
                $blockinstance->blockname = 'user_favorites';
                $blockinstance->parentcontextid = $context->id;
                $blockinstance->showinsubcontexts = 0;
                $blockinstance->pagetypepattern = 'course-view-*';
                $blockinstance->subpagepattern = NULL;
                $blockinstance->defaultregion = 'side-pre';
                $blockinstance->defaultweight = 0;
                $blockinstance->visible = 1;
                $blockinstance->configdata = NULL;
                $blockinstance->timecreated = time();
                $blockinstance->timemodified = time();

                $DB->insert_record('block_instances', $blockinstance);
                echo '<span style="color:green;">[添加]</span> ' . htmlspecialchars($course->fullname) . ' (ID: ' . $course->id . ')<br>';
                $count++;
            } else {
                echo '<span style="color:#888;">[已存在]</span> ' . htmlspecialchars($course->fullname) . ' (ID: ' . $course->id . ')<br>';
                $skip++;
            }
        } catch (\Exception $e) {
            echo '<span style="color:red;">[错误]</span> ' . htmlspecialchars($course->fullname) . ': ' . htmlspecialchars($e->getMessage()) . '<br>';
            $error++;
        }
    }

    echo '<hr>';
    echo '<strong>完成统计</strong><br>';
    echo '总课程数: ' . count($courses) . '<br>';
    echo '<span style="color:green;">成功添加: ' . $count . '</span><br>';
    echo '<span style="color:#888;">已存在: ' . $skip . '</span><br>';
    if ($error > 0) {
        echo '<span style="color:red;">错误: ' . $error . '</span><br>';
    }

} catch (\Exception $e) {
    echo '<strong style="color:red;">执行错误:</strong><br>';
    echo htmlspecialchars($e->getMessage()) . '<br><br>';
    echo '<strong>文件:</strong> ' . htmlspecialchars($e->getFile()) . ' 行 ' . $e->getLine() . '<br>';
    echo '<pre style="background:#fee; padding:10px;">' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
}

echo '</pre>';