function FunnelTab(button, content) {
    'use strict';
    var funnelTab = new Tab(button, content);
    var timeFilter = new TimeFilter(content, updateFunnel);

    //WYSIWYG init
    content.find('#funnel-email-body').richText();

    var $subject = content.find('#funnel-email-subject');
    var $richTextEditor = content.find('.richText-editor');

    funnelTab.courseStructureView = content.find('.tab-content');

    content.find('#funnel-send-email-btn').click(function () {
        var $funnelCheckbox = content.find("input:checkbox[name=funnel_send_email]:checked");
        var emails = '';
        var data;

        content.find('.send-email-message').addClass('hidden');

        $funnelCheckbox.each(function () {
            if (emails.length > 0 && $(this).val()) {
                emails += ',';
            }
            emails += $(this).val();
        });

        data = {
            emails: emails,
            subject: $subject.val(),
            body: $richTextEditor.html(),
        };

        function isValid(data) {
            return !!data.emails && !!data.subject && !!data.body
        }

        if (!isValid(data)) {
            content.find('.send-email-message.validation-error-message').removeClass('hidden');
            return;
        }

        $.ajax({
            type: "POST",
            url: "api/funnel/send_email/",
            data: data,
            dataType: "json",
            success: function () {
                content.find('.send-email-message.success-message').removeClass('hidden');
                // clear fields
                $subject.val('');
                $richTextEditor.html('');
                $funnelCheckbox.prop('checked', false)
            },
            error: function () {
                content.find('.send-email-message.error-message').removeClass('hidden');
            },
        });
    });

    function setActionChecbox() {
      $("[name=funnel_send_email].level-0").on('click', function (ev) {
        ev.stopPropagation();
        var $ev = $(ev.currentTarget);
        var $blockContent = $ev.parents('.funnel-item-0');
        $blockContent.find("[name=funnel_send_email].level-1:enabled").prop('checked', ev.currentTarget.checked)
      });

      $("[name=funnel_send_email].level-1").on('click', function (ev) {
        ev.stopPropagation();
        var $ev = $(ev.currentTarget);
        var $blockContent = $ev.parents('.funnel-item-0');
        $blockContent.find("[name=funnel_send_email].level-0").prop(
          'checked',
          $blockContent.find("[name=funnel_send_email].level-1:checked").length === $blockContent.find("[name=funnel_send_email].level-1:enabled").length
        )
      });
    }

    function openLocation() {
        var items = [funnelTab.viewContent.find(
            '*[data-edxid="' + funnelTab.locationToOpen.value + '"]'
        )];
        while (!items.slice(-1)[0].hasClass('funnel-item-0')) {
            items.push(items.slice(-1)[0].parent())
        }
        items.map(function (el) {
            return el.click()}
        );
        funnelTab.locationToOpen = undefined;
    }

    function updateFunnel(timeFilter) {
        function onSuccess(response) {
            funnelTab.courseStructure = response.courses_structure;

            funnelTab.viewContent = funnelTab.courseStructureView.find('.content');
            funnelTab.viewContent.empty();
            funnelTab.viewContent.append(generateFunnel(funnelTab.courseStructure));
            setActionChecbox();
            $('.funnel-item-0').on('click', function (e) {
                $(e.target).closest('.funnel-item').toggleClass('active');
            });

            if(funnelTab.locationToOpen) {
                openLocation();
            }
        }

        function generateFunnel(data) {
            return data.map(function (el) {
              return (el.level > 2) ? '' : generateFunnelItem(el, generateFunnel(el.children))
            }).join(' ');
        }

        function generateFunnelItem(item, children) {
            var tpl = _.template(
              '<div class="<%= className %>" data-edxid="<%= itemId %>">' +
                  '<div class="funnel-item-content">' +
                      '<span class="funnel-item-incoming"><%= incoming %></span>' +
                      '<span class="funnel-item-outgoing"><%= outcoming %></span>' +
                      '<%if (level < 2) {%>' +
                      '<span class="funnel-item-outgoing input-checkbox">' +
                          '<input type="checkbox" class="level-<%= level %>" name="funnel_send_email" <%if (studentEmails.length == 0) {%>disabled <%}%> value="<%= studentEmails %>">' +
                      '</span>' +
                      '<%}%>' +
                      '<span class="funnel-item-name"><%= itemName %></span>' +
                      '<span class="funnel-item-stuck">stuck: <%= stuck %></span>' +
                  '</div>' +
                  '<%= children %>' +
              '</div>'
            );

            return tpl({
              className: 'funnel-item funnel-item-' + item.level,
              itemId: item.id,
              itemName: item.name,
              incoming: item.student_count_in,
              outcoming: item.student_count_out,
              stuck: item.student_count,
              studentEmails: item.student_emails,
              children: children,
              level: item.level
            })
        }

        function onError() {
            alert('Can not load statistic for the selected course');
        }

        $.ajax({
            type: 'POST',
            url: 'api/funnel/',
            data: timeFilter.timestampRange,
            dataType: 'json',
            traditional: true,
            success: onSuccess,
            error: onError,
            beforeSend: timeFilter.setLoader,
            complete: timeFilter.removeLoader,
        });
    }

    function loadTabData() {
      try {
        var courseDatesInfo = $('.course-dates-data').data('course-dates')[funnelTab.tabHolder.course];
        if (courseDatesInfo.course_is_started) {
            $('.tab-banner').prop('hidden', true);
            $('.tab-content').prop('hidden', false);
            if (courseDatesInfo.course_start !== "null") {
              timeFilter.startDate = moment(courseDatesInfo.course_start * 1000);
            }
            if (courseDatesInfo.course_end !== "null") {
              timeFilter.endDate = moment(courseDatesInfo.course_end * 1000);
            }
        } else {
            $('.tab-banner').prop('hidden', false);
            $('.tab-content').prop('hidden', true);
        }
      }
      catch (error) {
        console.error(error);
      }

      updateFunnel(timeFilter);
    }

    funnelTab.loadTabData = loadTabData;

    return funnelTab;
}