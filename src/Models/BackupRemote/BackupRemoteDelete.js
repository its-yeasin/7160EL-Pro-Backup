const moment = require('moment')

class BackupDel {
  constructor(frequency, quantity, retention, uploads, timeStampNow) {
    this.frequency = frequency // hourly, daily
    this.quantity = quantity
    this.retention = retention
    this.uploads = [...uploads]
    this.timeStampNow = timeStampNow
    this.deleteIds = []
  }

  calcDailyQuantity() {
    if (this.frequency === 'daily') {
      return 1
    }

    if (this.frequency === 'hourly') {
      return 24
    }

    return 24
  }

  isDeleteRequired() {
    return this.uploads.length >= this.quantity
  }

  dayCount() {
    // backups group by date
    const backupsGroupByDate = this.uploads.reduce((acc, backup) => {
      const key = moment(backup.timeCreated * 1000).format('YYYY-MM-DD')

      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(backup)
      return acc
    }, {})

    // count by date
    const countByDate = Object.keys(backupsGroupByDate).map((key) => {
      const age = moment(this.timeStampNow * 1000).diff(moment(key), 'day')

      return {
        date: key,
        count: backupsGroupByDate[key].length,
        age,
      }
    })

    return countByDate
  }

  lastNumberOfDays() {
    const days = []
    const count = Math.floor((this.quantity - this.retention) / (24 / this.frequency - 1))

    for (let i = 0; i < count; i++) {
      const t = moment.unix(this.timeStampNow / 1000).subtract(i, 'day')
      days.push(t.format('YYYY-MM-DD'))
    }
    return days
  }

  removeFromTheUploads(id, rules = '') {
    if (this.isDeleteRequired()) {
      // push to deleteIds if not exists
      if (!this.deleteIds.find((x) => x.id === id)) {
        this.deleteIds.push({ id, rules })
      }

      // Remove from the uploads
      const index = this.uploads.findIndex((x) => {
        return x.id === id
      })
      this.uploads.splice(index, 1)
    }
  }

  emptyByDate(date) {
    const dBackups = this.uploads.filter((x) => {
      return x.date === date
    })

    for (const backup of dBackups) {
      this.removeFromTheUploads(backup._id, 'emptyByDate')
    }
  }

  deleteByDays(date) {
    const dBackups = this.uploads.filter((x) => {
      const upDate = moment.unix(x.timeCreated).format('YYYY-MM-DD')
      return upDate === date
    })

    // Remove the first element
    dBackups.shift()

    for (const backup of dBackups) {
      this.removeFromTheUploads(backup._id, 'deleteByDays')
    }
  }

  deleteByQuantity({ date }) {
    // count, age
    const dBackups = this.uploads
      .filter((x) => {
        const upDate = moment.unix(x.timeCreated).format('YYYY-MM-DD')
        return upDate === date
      })
      .sort((a, b) => {
        return b.timeCreated - a.timeCreated
      })

    // Remove first 24 elements
    dBackups.splice(0, this.calcDailyQuantity())

    for (const backup of dBackups) {
      this.removeFromTheUploads(backup._id, 'deleteByQuantity')
    }
  }

  deleteSelector() {
    // Count by date
    const countByDate = this.dayCount().sort((a, b) => {
      return b.age - a.age
    })

    // Delete by quantity
    countByDate.map((x) => {
      this.deleteByQuantity(x)
    })

    // Delete by days
    countByDate.map((x) => {
      if (x.age >= this.retention) {
        this.emptyByDate(x.date)
      } else {
        this.deleteByDays(x.date)
      }
    })

    return this.deleteIds
  }
}

module.exports = {
  BackupDel,
}
