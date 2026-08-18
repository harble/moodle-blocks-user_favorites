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
 * Block user favorites AMD module.
 *
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 * @copyright 2018 MFreak.nl | LdesignMedia.nl
 * @author    Luuk Verhoeven
 **/

/* eslint no-unused-expressions: "off", no-console:off, no-invalid-this:"off",no-script-url:"off", block-scoped-var: "off" */
define(['jquery', 'core/ajax', 'core/notification', 'core/log', 'core/sortable_list', 'core/modal_factory',
    'core/modal_events', 'core/str'],
    function($, Ajax, Notification, Log, SortableList, ModalFactory, ModalEvents, Str) {

        /**
         * Opts that are possible to set.
         *
         * @type {{id: number, debugjs: boolean}}
         */
        let opts = {
            debugjs: true, id: 0, url: '', hash: ''
        };

        /**
         * Set options base on listed options
         * @param {object} options
         */
        const setOptions = function(options) {
            "use strict";
            let key, vartype;
            for (key in opts) {
                if (opts.hasOwnProperty(key) && options.hasOwnProperty(key)) {

                    // Casting to prevent errors.
                    vartype = typeof opts[key];
                    if (vartype === "boolean") {
                        opts[key] = Boolean(options[key]);
                    } else if (vartype === 'number') {
                        opts[key] = Number(options[key]);
                    } else if (vartype === 'string') {
                        opts[key] = String(options[key]);
                    }
                    // Skip all other types.
                }
            }
        };

        const attachDragDropHandlers = function() {
            $('ol#block_user_favorites-items > li').on(SortableList.EVENTS.DRAGEND, function(evt, info) {
                if (info.positionChanged) {
                    favoritesModule.setOrder();
                }
                evt.stopPropagation();
            });
            $('ol#block_user_favorites-items > li').on(SortableList.EVENTS.DRAGSTART, (evt, info) => {
                setTimeout(() => {
                    $('.sortable-list-is-dragged').width(info.element.width());
                }, 501);
            });
        };

        /**
         * Get default title for favorites.
         *
         * Rules:
         * 1. If #defaulttemplate-single div exists, combine its first <p> text with #page-header h1
         * 2. If .hsuforum-thread-header div exists, use breadcrumb items (skip first) joined by '/'
         * 3. Otherwise, use first breadcrumb item + "：" + #page-header h1
         * 4. Fallback to document title
         *
         * @returns {string}
         */
        const getDefaultTitle = function() {
            var $single = $('#defaulttemplate-single');

            if ($single.length) {
                var contentTitle = $.trim($single.find('p').first().text());
                var $header = $('#page-header');
                var headerTitle = '';
                if ($header.length) {
                    headerTitle = $.trim($header.find('h1').first().text());
                }
                if (headerTitle && contentTitle) {
                    return headerTitle + ' / ' + contentTitle;
                }
                if (contentTitle) {
                    return contentTitle;
                }
            }

            var $threadHeader = $('div.hsuforum-thread-header');
            if ($threadHeader.length) {
                var $crumbsForum = $('li.breadcrumb-item');
                if ($crumbsForum.length > 1) {
                    var parts = [];
                    var normalize = function(s) {
                        return $.trim(s).replace(/\s+/g, '');
                    };
                    var secondItemText = normalize($crumbsForum.eq(1).text());
                    var secondItemInThird = false;
                    if ($crumbsForum.length > 2) {
                        var thirdItemText = normalize($crumbsForum.eq(2).text());
                        if (secondItemText && thirdItemText.indexOf(secondItemText) !== -1) {
                            secondItemInThird = true;
                        }
                    }
                    $crumbsForum.each(function(index) {
                        if (index > 0) {
                            if (index === 1 && secondItemInThird) {
                                return;
                            }
                            var text = normalize($.trim($(this).text()));
                            if (text) {
                                parts.push(text);
                            }
                        }
                    });
                    if (parts.length) {
                        return parts.join(' / ');
                    }
                }
            }

            var $headerFallback = $('#page-header');
            if ($headerFallback.length) {
                var courseTitle = $.trim($headerFallback.find('h1').first().text());
                var $crumbs = $('li.breadcrumb-item');
                var courseCatalog = '';
                if ($crumbs.length) {
                    courseCatalog = $.trim($crumbs.first().text());
                }
                if (courseCatalog && courseTitle) {
                    return courseCatalog + ' / ' + courseTitle;
                }
                if (courseTitle) {
                    return courseTitle;
                }
            }

            return $.trim($('title').text());
        };

        const favoritesModule = {

            /**
             * Add or update a url
             *
             * @param {object} data
             * @param {string} title
             */
            setUrl: function(data, title) {

                if (data.hash === null) {
                    Notification.exception(new Error('No hash found'));
                    return;
                }

                if (data.hasOwnProperty('url') && data.url === null) {
                    delete data.url;
                }

                // Remove not correct closed confirm dialogs.
                $('.modal').remove();

                Str.get_strings([
                    {key: 'javascript:set_title', component: 'block_user_favorites'},
                    {key: 'javascript:yes', component: 'block_user_favorites'},
                    {key: 'javascript:no', component: 'block_user_favorites'},
                ]).then(function(strings) {
                    return ModalFactory.create({
                        type: ModalFactory.types.SAVE_CANCEL,
                        title: strings[0],
                        body: '<input class="form-control" id="favorite-url" value="'
                            + title.replace(/"/g, '&quot;') + '">',
                    });
                }).then(function(modal) {
                    modal.setSaveButtonText(Str.get_string('javascript:yes', 'block_user_favorites'));
                    modal.getRoot().on(ModalEvents.save, function() {
                        let request = Ajax.call([{
                            methodname: 'block_user_favorites_set_url', args: {
                                hash: data.hash,
                                optional: {
                                    url: data.url,
                                },
                                title: modal.getRoot().find('#favorite-url').val(),
                                blockid: opts.id,
                            }
                        }]);

                        request[0].done(function(response) {
                            Log.log(response);
                            favoritesModule.reload();
                        }).fail(Notification.exception);
                    });
                    modal.show();
                    return modal;
                }).catch(Notification.exception);
            },

            /**
             * Add or update a url
             */
            setOrder: function() {
                $('ol#block_user_favorites-items li').each(function(index) {
                    Ajax.call([{
                        methodname: 'block_user_favorites_set_order', args: {
                            hash: $(this).data('hash'), sortorder: index
                        }
                    }]);
                });
            },

            /**
             * Delete a url
             *
             * @param {object} data
             */
            remove: function(data) {

                let request = Ajax.call([{
                    methodname: 'block_user_favorites_delete_url', args: {
                        hash: data.hash, blockid: opts.id,
                    }
                }]);

                request[0].done(function(response) {
                    Log.log(response);
                    favoritesModule.reload();
                }).fail(Notification.exception);
            },

            /**
             * Reload the block
             */
            reload: function() {

                let request = Ajax.call([{
                    methodname: 'block_user_favorites_content', args: {
                        url: opts.url, blockid: opts.id,
                    }
                }]);

                request[0].done(function(response) {
                    Log.log(response);
                    $('.block_user_favorites .content').html(response.content);
                    // Re-attach drag/drop callback on the new content to ensure sorting still works after content refresh.
                    attachDragDropHandlers();
                }).fail(Notification.exception);

            },

            /**
             * Init event triggers.
             */
            init: function() {
                Log.log('Init block_user_favorites');

                $('.block_user_favorites, .block_user_favorites_auto').on('click', '#block_user_favorites_set', function() {

                    // Set current as favorite.
                    favoritesModule.setUrl({
                        'hash': opts.hash,
                        'url': opts.url,
                    }, getDefaultTitle());

                }).on('click', '#block_user_favorites_delete', function() {
                    // Delete current pages from favorites.
                    favoritesModule.remove({
                        'hash': opts.hash,
                    });

                }).on('click', '.fa-menu-toggle', function(e) {
                    e.stopPropagation();
                    var $menu = $(this).next('.fa-menu-dropdown');
                    $('.fa-menu-dropdown').not($menu).removeClass('show');
                    $menu.toggleClass('show');

                }).on('click', '.fa-menu-dropdown', function(e) {
                    e.stopPropagation();

                }).on('click', '.favorite-move-up', function() {
                    $('.fa-menu-dropdown').removeClass('show');
                    var $li = $(this).closest('li');
                    var $prev = $li.prev('li');
                    if ($prev.length) {
                        $li.insertBefore($prev);
                        favoritesModule.setOrder();
                    }

                }).on('click', '.favorite-move-down', function() {
                    $('.fa-menu-dropdown').removeClass('show');
                    var $li = $(this).closest('li');
                    var $next = $li.next('li');
                    if ($next.length) {
                        $li.insertAfter($next);
                        favoritesModule.setOrder();
                    }

                }).on('click', '.favorite-remove', function() {
                    $('.fa-menu-dropdown').removeClass('show');
                    favoritesModule.remove($(this).closest('li').data());

                }).on('click', '.favorite-edit', function() {
                    $('.fa-menu-dropdown').removeClass('show');
                    var $li = $(this).closest('li');
                    var data = $li.data();
                    Log.log('.favorite-edit');
                    Log.log(data);
                    data.url = null;
                    favoritesModule.setUrl(data, $li.find('a').text());
                });

                $(document).on('click', function() {
                    $('.fa-menu-dropdown').removeClass('show');
                });
                // Instantiate new SortableList component. this only needs to happen once (i.e. not on refresh again).
                new SortableList('ol#block_user_favorites-items');
                // Attach the drag/drop callbacks.
                attachDragDropHandlers();
            }
        };

        return {
            /**
             * Init
             *
             * @param {object} args
             */
            initialise: function(args) {

                // Load the args passed from PHP.
                setOptions(args);

                // Set internal debug console.
                Log.log(opts.debugjs);
                Log.log('Block User Favorites v2.0');
                favoritesModule.init();
            }
        };
    });