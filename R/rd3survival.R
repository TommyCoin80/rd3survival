#' rd3survival
#'
#' Plot a survival fit, single or stratified
#'
#' @import htmlwidgets
#'
#' @export
rd3survival <- function(sf, xlim = NULL, ylim = NULL,  width = NULL, height = NULL, elementId = NULL) {
  
  library(magrittr)
  library(dplyr)
  library(broom)
  
  prepData <- function(sf) {
    tsf <- broom::tidy(sf)
    jsonlite::toJSON(tsf)
  }
  
  if(length(xlim) != 2)  {
    xlim <- NULL
  }
  
  if(length(ylim) != 2)  {
    ylim <- NULL
  }

  
  # forward options using x
  x = list(
    data = prepData(sf),
    xlim = xlim,
    ylim = ylim
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'rd3survival',
    x,
    width = width,
    height = height,
    package = 'rd3survival',
    elementId = elementId
  )
}

#' Shiny bindings for rd3survival
#'
#' Output and render functions for using rd3survival within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a rd3survival
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name rd3survival-shiny
#'
#' @export
rd3survivalOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'rd3survival', width, height, package = 'rd3survival')
}

#' @rdname rd3survival-shiny
#' @export
renderRd3survival <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, rd3survivalOutput, env, quoted = TRUE)
}
