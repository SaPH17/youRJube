package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"time"
	"youRJube/graph/generated"
	"youRJube/graph/model"
)

func (r *mutationResolver) CreateUser(ctx context.Context, input *model.NewUser) (*model.User, error) {
	user := model.User{
		Email:        input.Email,
		RestrictMode: input.RestrictMode,
		Location:     input.Location,
	}

	_, err := r.DB.Model(&user).Insert()

	if err != nil {
		return nil, errors.New("Insert failed")
	}

	return &user, nil
}

func (r *mutationResolver) UpdateUser(ctx context.Context, id string, input *model.NewUser) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreatePremiumSubscription(ctx context.Context, input *model.NewPremiumSubscription) (*model.PremiumSubscription, error) {
	var user []*model.User

	err := r.DB.Model(&user).Where("id = ?", input.UserID).First()

	if user == nil || err != nil {
		return nil, errors.New("User doesn't exists")
	}

	year, month, day := time.Now().Date()

	var endyear int
	var endmonth int

	if input.Plan == "Annualy" {
		endyear = year + 1
		endmonth = int(month)
	} else {
		endyear = year
		endmonth = int(month) + 1
		
		if(endmonth == 13){
			endmonth = 1
		}
	}

	premiumsubs := model.PremiumSubscription{
		UserID:     input.UserID,
		StartDay:   day,
		StartMonth: int(month),
		StartYear:  year,
		EndDay:     day,
		EndMonth:   endmonth,
		EndYear:    endyear,
		Plan:       input.Plan,
	}


	_, err2 := r.DB.Model(&premiumsubs).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &premiumsubs, nil
}

func (r *mutationResolver) CreateChannel(ctx context.Context, input *model.NewChannel) (*model.Channel, error) {
	var user []*model.User

	err := r.DB.Model(&user).Where("id = ?", input.UserID).First()

	if user == nil || err != nil {
		return nil, errors.New("User doesn't exists")
	}

	year, month, day := time.Now().Date()

	channel := model.Channel{
		UserID:          input.UserID,
		Name:            input.Name,
		BackgroundImage: input.BackgroundImage,
		Icon:            input.Icon,
		Description:     input.Description,
		JoinDay:         day,
		JoinMonth:       int(month),
		JoinYear:        year,
		SubscriberCount: 1,
	}

	_, err2 := r.DB.Model(&channel).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &channel, nil
}

func (r *mutationResolver) UpdateChannel(ctx context.Context, id string, input *model.NewChannel) (*model.Channel, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateChannelSocialMedia(ctx context.Context, input *model.NewChannelSocialMedia) (*model.ChannelSocialMedia, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateChannelSocialMedia(ctx context.Context, id string, input *model.NewChannelSocialMedia) (*model.ChannelSocialMedia, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteChannelSocialMedia(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateUserSubscription(ctx context.Context, input *model.NewUserSubscription) (*model.UserSubscription, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteUserSubscription(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateUserSubscription(ctx context.Context, id string, input *model.NewUserSubscription) (*model.UserSubscription, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateCommunityPost(ctx context.Context, input *model.NewCommunityPost) (*model.CommunityPost, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteCommunityPost(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateCommunityPost(ctx context.Context, id string, input *model.NewCommunityPost) (*model.CommunityPost, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateVideo(ctx context.Context, input *model.NewVideo) (*model.Video, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("id = ?", input.ChannelID).First()

	if channel == nil || err != nil {
		return nil, errors.New("Channel doesn't exists")
	}

	year, month, day := time.Now().Date()

	video := model.Video{
		ChannelID:     input.ChannelID,
		Title:         input.Title,
		Description:   input.Description,
		Thumbnail:     input.Thumbnail,
		UploadDay:     day,
		UploadMonth:   int(month),
		UploadYear:    year,
		Category:      input.Category,
		Location:      input.Location,
		View:          1,
		Privacy:       input.Privacy,
		IsPremium:     input.IsPremium,
		AgeRestricted: input.AgeRestricted,
		VideoURL:      input.VideoURL,
		Like:          1,
		Dislike:       1,
	}

	_, err2 := r.DB.Model(&video).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &video, nil
}

func (r *mutationResolver) UpdateVideo(ctx context.Context, id string, input *model.NewVideo) (*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteVideo(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateVideoTag(ctx context.Context, input *model.NewVideoTag) (*model.VideoTag, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteVideoTag(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreatePlaylist(ctx context.Context, input *model.NewPlaylist) (*model.Playlist, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("id = ?", input.ChannelID).First()

	if channel == nil || err != nil {
		return nil, errors.New("Channel doesn't exists")
	}

	year, month, day := time.Now().Date()

	playlist := model.Playlist{
		ChannelID:        input.ChannelID,
		Title:            input.Title,
		Description:      input.Description,
		Privacy:          input.Privacy,
		Thumbnail:        input.Thumbnail,
		LastUpdatedDay:   day,
		LastUpdatedMonth: int(month),
		LastUpdatedYear:  year,
		View:             input.View,
	}

	_, err2 := r.DB.Model(&playlist).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &playlist, nil
}

func (r *mutationResolver) DeletePlaylist(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdatePlaylist(ctx context.Context, id string, input *model.NewPlaylist) (*model.Playlist, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreatePlaylistDetail(ctx context.Context, input *model.NewPlaylistDetail) (*model.PlaylistDetail, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeletePlaylistDetail(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateComment(ctx context.Context, input *model.NewComment) (*model.Comment, error) {
	var video []*model.Video

	err := r.DB.Model(&video).Where("id = ?", input.VideoID).First()

	if video == nil || err != nil {
		return nil, errors.New("Video doesn't exists")
	}

	year, month, day := time.Now().Date()

	comment := model.Comment{
		VideoID:   input.VideoID,
		ChannelID: input.ChannelID,
		Like:      1,
		Dislike:   1,
		Content:   input.Content,
		Day:       day,
		Month:     int(month),
		Year:      year,
	}

	_, err2 := r.DB.Model(&comment).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &comment, nil
}

func (r *mutationResolver) CreateReply(ctx context.Context, input *model.NewReply) (*model.Reply, error) {
	var comment []*model.Comment

	err := r.DB.Model(&comment).Where("id = ?", input.CommentID).First()

	if comment == nil || err != nil {
		return nil, errors.New("Comment doesn't exists")
	}

	year, month, day := time.Now().Date()

	reply := model.Reply{
		CommentID: input.CommentID,
		ChannelID: input.ChannelID,
		Content:   input.Content,
		Day:       day,
		Month:     int(month),
		Year:      year,
	}

	_, err2 := r.DB.Model(&reply).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &reply, nil
}

func (r *mutationResolver) CreateNotification(ctx context.Context, input *model.NewNotification) (*model.Notification, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateNotification(ctx context.Context, id string, input *model.NewNotification) (*model.Notification, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetUserByUserID(ctx context.Context, id string) ([]*model.User, error) {
	var users []*model.User

	err := r.DB.Model(&users).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Failed to query user")
	}

	return users, nil
}

func (r *queryResolver) GetUserByEmail(ctx context.Context, email *string) ([]*model.User, error) {
	var users []*model.User

	err := r.DB.Model(&users).Where("email = ?", email).First()

	if err != nil {
		return nil, errors.New("Failed to query user")
	}

	return users, nil
}

func (r *queryResolver) GetPremiumSubscriptionByUserID(ctx context.Context, userID string) ([]*model.PremiumSubscription, error) {
	var premiumSubs []*model.PremiumSubscription

	err := r.DB.Model(&premiumSubs).Where("user_id = ?", userID).Select()

	if err != nil {
		return nil, errors.New("Failed to query premium subscription")
	}

	return premiumSubs, nil
}

func (r *queryResolver) GetChannelByID(ctx context.Context, id string) ([]*model.Channel, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Failed to query channel")
	}

	return channel, nil
}

func (r *queryResolver) GetChannelByUserID(ctx context.Context, userID string) ([]*model.Channel, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("user_id = ?", userID).First()

	if err != nil {
		return nil, errors.New("Failed to query channel")
	}

	return channel, nil
}

func (r *queryResolver) GetchannelByName(ctx context.Context, name string) ([]*model.Channel, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetChannelSocialMediaByChannelID(ctx context.Context, channelID string) ([]*model.ChannelSocialMedia, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetUserSubscriptionByUserID(ctx context.Context, userID string) ([]*model.UserSubscription, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetCommunityPostByChannelID(ctx context.Context, channelID string) ([]*model.CommunityPost, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetVideoByID(ctx context.Context, id string) ([]*model.Video, error) {
	var video []*model.Video

	err := r.DB.Model(&video).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return video, nil
}

func (r *queryResolver) GetVideoByTitle(ctx context.Context, title string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetVideoByChannelID(ctx context.Context, channelID string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetTrendingVideo(ctx context.Context, location string, isRestrict string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetCategoryVideo(ctx context.Context, rangeArg string, isRestrict string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetHomeVideo(ctx context.Context, location string, isRestrict string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetRelatedVideo(ctx context.Context, category string, location string, isRestrict string) ([]*model.Video, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetVideo(ctx context.Context) ([]*model.Video, error) {
	var videos []*model.Video

	err := r.DB.Model(&videos).Select()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetVideoTagByVideoID(ctx context.Context, videoID string) ([]*model.VideoTag, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetPlaylistByChannelID(ctx context.Context, channelID string) ([]*model.Playlist, error) {
	var playlist []*model.Playlist

	err := r.DB.Model(&playlist).Where("channel_id = ?", channelID).Select()

	if err != nil {
		return nil, errors.New("Failed to query playlist")
	}

	return playlist, nil
}

func (r *queryResolver) GetPlaylistByUserID(ctx context.Context, userID string) ([]*model.Playlist, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetPlaylistDetailByPlaylistID(ctx context.Context, playlistID string) ([]*model.PlaylistDetail, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetCommentByVideoID(ctx context.Context, videoID string) ([]*model.Comment, error) {
	var comments []*model.Comment

	err := r.DB.Model(&comments).Where("video_id = ?", videoID).Select()

	if err != nil {
		return nil, errors.New("Failed to query comments")
	}

	return comments, nil
}

func (r *queryResolver) GetReplyByCommentID(ctx context.Context, commentID string) ([]*model.Reply, error) {
	var replies []*model.Reply

	err := r.DB.Model(&replies).Where("comment_id = ?", commentID).Select()

	if err != nil {
		return nil, errors.New("Failed to query replies")
	}

	return replies, nil
}

func (r *queryResolver) GetNotificationByUserID(ctx context.Context, userID string) ([]*model.Notification, error) {
	panic(fmt.Errorf("not implemented"))
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *mutationResolver) CreateSubscription(ctx context.Context, input *model.NewUserSubscription) (*model.UserSubscription, error) {
	panic(fmt.Errorf("not implemented"))
}
func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	var users []*model.User

	err := r.DB.Model(&users).Select()

	if err != nil {
		return nil, errors.New("Failed to query user")
	}

	return users, nil
}
