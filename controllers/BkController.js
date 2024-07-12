const AnimeSchema = require('../models/anime');
const ObjectId = require('mongoose').Types.ObjectId;


exports.index = (req, res) => {
    res.render('./story/index');
}

exports.animeTrades = (req, res) => {
    AnimeSchema.find().sort({ "title": 1 })
        .then(animeStories => {
            AnimeSchema.distinct("category").then(categories => {
                res.render('./story/trades', { animeStories, categories });
            })
        })
        .catch(err => next(err))
}

exports.newAnime = (req, res, next) => {
    res.render('./story/newTrade');
}


exports.new = (req, res) => {
    res.render('./story/new');
}

exports.create = (req, res) => {
    let item = new AnimeSchema(req.body);
    item.author = req.session.user;
    item.status = "Available";
    item.save()
        .then(res.redirect('/animeTrades'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        })
}

exports.show = (req, res, next) => {

    let id = req.params.id;

            AnimeSchema.findById(id)
                .then(anime => {
                    if (anime) {
                        let canWatch = true;
                    if (anime.watchList.includes(req.session.user)) {
                      canWatch = false;
                    }
                        res.render('./story/trade', { anime,canWatch });
                    } else {
                        let err = new Error('Cannot find a Anime with id ' + id);
                        err.status = 404;
                        next(err);
                    }

                })
                .catch(err => next(err))

}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    if (ObjectId.isValid(id)) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid Anime id');
            err.status = 404;
            return next(err);
        }
        AnimeSchema.findById(id)
            .then(anime => {
                if (anime) {
                    res.render('./story/edit', { anime });
                } else {
                    let err = new Error('Cannot find a Anime with id ' + id);
                    err.status = 404;
                    next(err);
                }

            })
            .catch(err => next(err))
    } else {
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err);
    }
}

exports.update = (req, res, next) => {

    console.log("req", req);
    let animeDetails = req.body;
    let id = req.params.id;
    if (ObjectId.isValid(id)) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid Anime id');
            err.status = 404;
            return next(err);
        }
        AnimeSchema.findByIdAndUpdate(id, animeDetails, { useFindAndModify: false, runValidators: true })
            .then(animeDetails => {
                if (animeDetails) {
                    res.redirect('/animetrade/' + id);
                } else {
                    let err = new Error('Cannot find a Anime with id ' + id);
                    err.status = 404;
                    next(err);
                }

            })
            .catch(err => next(err))
    } else {
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err);
    }
}

exports.delete = (req, res, next) => {

    let id = req.params.id;
    if (ObjectId.isValid(id)) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid Anime id');
            err.status = 404;
            return next(err);
        }
        AnimeSchema.findByIdAndDelete(id, { useFindAndModify: false })
            .then(anime => {
                if (anime) {
                    res.redirect('/animeTrades');
                } else {
                    let err = new Error('Cannot find a Anime with id ' + id);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err))
    }
    else {
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err);
    }

}


///


exports.watch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    AnimeSchema
      .findByIdAndUpdate(
        id,
        { $addToSet: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  };

  exports.unwatch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    AnimeSchema
      .findByIdAndUpdate(
        id,
        { $pull: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        next(err);
      });
  };


  exports.getAvailable = (req, res, next) => {
    let id = req.params.id;
    let user=req.session
    Promise.all([
        AnimeSchema.findById(id),
        AnimeSchema.find({ author: req.session.user, status: "Available" }),
    ])
      .then((results) => {
        const [trade, animeDetails] = results;
        if (trade) {
          res.render("./story/offerTrade", { user,id, animeDetails });
        } else {
          let err = new Error("Invalid trade id");
          err.status = 400;
          req.flash("error", err.message);
          return res.redirect("back");
        }
      })
      .catch((err) => next(err));
  };


  exports.makeOffer = (req, res, next) => {
    console.log("Makeoffer---------------------------")
    let id = req.params.id;
    let tradeItem = req.body.tradeItem;
    AnimeSchema
      .findByIdAndUpdate(
        tradeItem,
        { $set: { status: "Pending" } },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        if (trade) {
        } else {
          console.log("update failed");
        }
      })
      .catch((err) => next(err));
      AnimeSchema
      .findByIdAndUpdate(
        id,
        {
          $set: {
            offerItemId: tradeItem,
            offerItemOwner: req.session.user,
            status: "Pending",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
    return res.redirect("/users/profile");
  };


  exports.rejectOffer = (req, res, next) => {
    let tradeItem = req.params.tradeItemId;
    let itemId = req.params.itemId;
  
    AnimeSchema
      .findByIdAndUpdate(
        tradeItem,
        {
          $set: {
            offerItemId: null,
            offerItemOwner: null,
            status: "Available",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
      AnimeSchema
      .findByIdAndUpdate(
        itemId,
        {
          $set: {
            status: "Available",
            offerItemId: null,
            offerItemOwner: null,
          },
        },
        { useFindAndModify: false, runValidators: true }
      )
      .catch((err) => next(err));
  
    return res.redirect("/users/profile");
  };
  
  exports.manageOffer = (req, res, next) => {
    let id = req.params.id;
    AnimeSchema
      .findById(id)
      .populate("offerItemId", "id title category")
      .then((trade) => {
        if (trade) {
          res.render("./story/viewOffer", { trade });
        }
      })
      .catch((err) => next(err));
  };
  
  exports.acceptOffer = (req, res, next) => {
  let itemId = req.params.itemId;
  let tradeItemId = req.params.tradeItemId;
  AnimeSchema
    .findByIdAndUpdate(itemId, { $set: { status: "Traded" } })
    .then((trade) => {
      if (trade) {
        itemId = trade.offerItemId;
      }
    })
    .catch((err) => next(err));
    AnimeSchema
    .findByIdAndUpdate(tradeItemId, {
      $set: {
        status: "Traded",
        offerItemId: itemId,
        offerItemOwner: req.session.user,
      },
    })
    .then((item) => {
      if (item) {
        console.log("success updating second item");
       return res.redirect("/users/profile")
      }
    })
    .catch((err) => next(err));
};




