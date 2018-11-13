/**
 * Time range filtering component.
 * @param content - tab content
 * @param action - fn to trigger
 */
function TimeFilter(content, action) {
  var filter = this;
  var pickerDateFormat = $.datepicker.ISO_8601;  // 'yy-mm-dd' => 2018-02-02
  var momentDateFormat = 'YYYY-MM-DD';           // 2018-02-02
  var $selectPeriodBtn = content.find(".js-datepicker-btn");
  var periodDiv = content.find(".js-datepicker-dropdown");
  var $loader = content.find(".js-loader");
  this.minDate = null;

  this.$fromDatePicker = content.find(".js-from-datepicker")
    .datepicker({
      dateFormat: pickerDateFormat,
      onSelect: function(dateStr) {
        filter.$toDatePicker.datepicker("option", "minDate", dateStr);
        filter.startDate = moment(dateStr);
      }
    });
  this.$toDatePicker = content.find(".js-to-datepicker")
    .datepicker({
      maxDate: moment().format(momentDateFormat),
      dateFormat: pickerDateFormat,
      onSelect: function(dateStr) {
        filter.$fromDatePicker.datepicker("option", "maxDate", dateStr);
        filter.endDate = moment(dateStr);
      }
    });

  /**
   * Rerender date range selector.
   */
  this.updateStatPeriod = function() {
    $selectPeriodBtn.html(
      filter.startDate.format(momentDateFormat) + ' - ' + filter.endDate.format(momentDateFormat)
    );
  };

  Object.defineProperties(this, {
    startDate: {
      get: function() {
        return this._startDate;
      },
      set: function(val) {
        if (moment.isMoment(val) && val <= moment()) {  // do not set if Course starts in the Future
          this._startDate = val;
          this.$fromDatePicker.datepicker("setDate", val.format(momentDateFormat));
          if (this.endDate) {
            this.updateStatPeriod();
          }
        }
      }
    },
    endDate: {
      get: function() {
        return this._endDate;
      },
      set: function(val) {
        if (moment.isMoment(val)) {
          this._endDate = val;
          this.$toDatePicker.datepicker("setDate", val.format(momentDateFormat));
          if (this.startDate) {
            this.updateStatPeriod();
          }
        }
      }
    },
    timestampRange: {
      get: function() {
        return {
          from: this.startDate.unix(),
          to: this.endDate.unix(),
        }
      }
    }
  });

  // Handlers:
  $selectPeriodBtn.click(function() {
    filter.makeActive(this);
    periodDiv.toggleClass('show');
  });

  content.find(".js-date-apply-btn").click(function() {
    periodDiv.removeClass('show');
    action();
  });

  content.find(".js-select-1-week").click(function() {
    filter.makeActive(this);
    filter.startDate = moment().subtract(1, 'weeks').startOf('isoWeek');
    filter.endDate = moment().subtract(1, 'weeks').endOf('isoWeek');
    action();
  });

  content.find(".js-select-2-week").click(function() {
    filter.makeActive(this);
    filter.startDate = moment().subtract(2, 'weeks').startOf('isoWeek');
    filter.endDate = moment().subtract(1, 'weeks').endOf('isoWeek');
    action();
  });

  content.find(".js-select-4-week").click(function() {
    filter.makeActive(this);
    filter.startDate = moment().subtract(1, 'months').startOf('month');
    filter.endDate = moment().subtract(1, 'months').endOf('month');
    action();
  });

  content.find(".js-select-all-week").click(function() {
    filter.makeActive(this);
    filter.startDate = filter.minDate;
    filter.endDate = moment();
    action();
  });

  this.makeActive = function (target) {
    periodDiv.removeClass('show');
    content.find('.filter-btn').removeClass('active');
    $(target).addClass('active');
  };

  this.setLoader = function () {
    $loader.removeClass('hidden');
  };
  
  this.removeLoader = function () {
    $loader.addClass('hidden');
  };

  this.setMinDate = function () {
      filter.$fromDatePicker.datepicker("option", "minDate", filter.minDate.format(momentDateFormat));
  };
}
