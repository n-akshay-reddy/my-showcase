export const GET_USER_FULL_PROFILE = `
  query getUserFullProfile($username: String!) {

    allQuestionsCount {
      difficulty
      count
    }

    matchedUser(username: $username) {
      username
      githubUrl
      twitterUrl
      linkedinUrl

      activeBadge {
        displayName
        icon
      }

      contributions {
        points
        questionCount
        testcaseCount
      }

      profile {
        realName
        ranking
        userAvatar
        aboutMe
        countryName
        company 
        jobTitle
        skillTags
        websites
        birthday
        starRating
        reputation
        school
      }

      badges {
        id
        name
        shortName
        displayName
        icon
        hoverText
        medal {
          slug
          config {
            iconGif
            iconGifBackground
          }
        }
        creationDate
        category
      }

      upcomingBadges {
        name
        icon
        progress
      }

      languageProblemCount {
        languageName
        problemsSolved
      }

      tagProblemCounts {
        advanced {
          tagName
          tagSlug
          problemsSolved
        }
        intermediate {
          tagName
          tagSlug
          problemsSolved
        }
        fundamental {
          tagName
          tagSlug
          problemsSolved
        }
      }

      problemsSolvedBeatsStats {
        difficulty
        percentage
      }

      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }

      userCalendar {
        activeYears
        streak
        totalActiveDays
        dccBadges {
          timestamp
          badge {
            name
            icon
          }
        }
        submissionCalendar
      }
    }

    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
      badge {
        name
      }
    }

    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      trendDirection
      problemsSolved
      totalProblems
      finishTimeInSeconds
      contest {
        title
        startTime
      }
    }

    recentAcSubmissionList(username: $username, limit: 10) {
      id
      title
      titleSlug
      timestamp
      lang
      runtime
      memory
      url
      isPending
    }

    recentSubmissionList(username: $username, limit: 10) {
      id
      title
      titleSlug
      timestamp
      lang
      statusDisplay
      runtime
      memory
      url
      isPending
    }
  }
`;

export const GET_USER_CALENDAR = `
  query getUserCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        dccBadges {
          timestamp
          badge {
            name
            icon
          }
        }
        submissionCalendar
      }
    }
  }`;