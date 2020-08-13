package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"youRJube/graph/generated"
	"youRJube/graph/model"
)

func (r *mutationResolver) CreateUser(ctx context.Context, input *model.NewUser) (*model.User, error) {
	user := model.User{
		Email:           input.Email,
		RestrictMode:    input.RestrictMode,
		Location:        input.Location,
		LikedVideo:      input.LikedVideo,
		DislikedVideo:   input.DislikedVideo,
		LikedComment:    input.LikedComment,
		DislikedComment: input.DislikedComment,
		LikedPost:       input.LikedPost,
		DislikedPost:    input.DislikedPost,
	}

	_, err := r.DB.Model(&user).Insert()

	if err != nil {
		return nil, errors.New("Insert failed")
	}

	return &user, nil
}

func (r *mutationResolver) UpdateUser(ctx context.Context, id string, input *model.NewUser) (*model.User, error) {
	var user model.User

	err := r.DB.Model(&user).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("User doesn't exist")
	}

	user.Email = input.Email
	user.RestrictMode = input.RestrictMode
	user.Location = input.Location
	user.LikedVideo = input.LikedVideo
	user.DislikedVideo = input.DislikedVideo
	user.LikedComment = input.LikedComment
	user.DislikedComment = input.DislikedComment
	user.LikedPost = input.LikedPost
	user.DislikedPost = input.DislikedPost

	_, err2 := r.DB.Model(&user).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &user, nil
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

		if endmonth == 13 {
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
		SubscriberCount: input.SubscriberCount,
	}

	_, err2 := r.DB.Model(&channel).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &channel, nil
}

func (r *mutationResolver) UpdateChannel(ctx context.Context, id string, input *model.NewChannel) (*model.Channel, error) {
	var channel model.Channel

	err := r.DB.Model(&channel).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Channel doesn't exist")
	}

	channel.UserID = input.UserID
	channel.Name = input.Name
	channel.BackgroundImage = input.BackgroundImage
	channel.Icon = input.Icon
	channel.Description = input.Description
	channel.SubscriberCount = input.SubscriberCount

	_, err2 := r.DB.Model(&channel).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &channel, nil
}

func (r *mutationResolver) CreateChannelSocialMedia(ctx context.Context, input *model.NewChannelSocialMedia) (*model.ChannelSocialMedia, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("id = ?", input.ChannelID).First()

	if channel == nil || err != nil {
		return nil, errors.New("Channel doesn't exists")
	}

	socMed := model.ChannelSocialMedia{
		ChannelID:   input.ChannelID,
		SocialMedia: input.SocialMedia,
		Link:        input.Link,
	}

	_, err2 := r.DB.Model(&socMed).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &socMed, nil
}

func (r *mutationResolver) UpdateChannelSocialMedia(ctx context.Context, id string, input *model.NewChannelSocialMedia) (*model.ChannelSocialMedia, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteChannelSocialMedia(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateUserSubscription(ctx context.Context, input *model.NewUserSubscription) (*model.UserSubscription, error) {
	var user []*model.User
	var channel []*model.Channel

	err := r.DB.Model(&user).Where("id = ?", input.UserID).First()
	err2 := r.DB.Model(&channel).Where("id = ?", input.ChannelID).First()

	if user == nil || err != nil {
		return nil, errors.New("User doesn't exists")
	}

	if channel == nil || err2 != nil {
		return nil, errors.New("Channel doesn't exists")
	}

	year, month, day := time.Now().Date()

	userSubs := model.UserSubscription{
		UserID:         input.UserID,
		ChannelID:      input.ChannelID,
		SubscribeDay:   day,
		SubscribeMonth: int(month),
		SubscribeYear:  year,
		ShouldNotify:   input.ShouldNotify,
	}

	_, err3 := r.DB.Model(&userSubs).Insert()

	if err3 != nil {
		return nil, errors.New("Insert failed")
	}

	return &userSubs, nil
}

func (r *mutationResolver) DeleteUserSubscription(ctx context.Context, userID string, channelID string) (bool, error) {
	var subscription model.UserSubscription

	err := r.DB.Model(&subscription).Where("user_id = ? AND channel_id = ?", userID, channelID).First()

	if err != nil {
		return false, errors.New("Subscription not found")
	}

	_, err2 := r.DB.Model(&subscription).Where("user_id = ? AND channel_id = ?", userID, channelID).Delete()

	if err2 != nil {
		return false, errors.New("Delete failed")
	}

	return true, nil
}

func (r *mutationResolver) UpdateUserSubscription(ctx context.Context, userID string, channelID string, input *model.NewUserSubscription) (*model.UserSubscription, error) {
	var userSubs model.UserSubscription

	err := r.DB.Model(&userSubs).Where("user_id = ? AND channel_id = ?", userID, channelID).First()

	if err != nil {
		return nil, errors.New("Subscription doesn't exist")
	}

	userSubs.ChannelID = input.ChannelID
	userSubs.UserID = input.UserID
	userSubs.ShouldNotify = input.ShouldNotify

	_, err2 := r.DB.Model(&userSubs).Where("user_id = ? AND channel_id = ?", userID, channelID).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &userSubs, nil
}

func (r *mutationResolver) CreateCommunityPost(ctx context.Context, input *model.NewCommunityPost) (*model.CommunityPost, error) {
	var channel []*model.Channel

	err := r.DB.Model(&channel).Where("id = ?", input.ChannelID).First()

	if channel == nil || err != nil {
		return nil, errors.New("Channel doesn't exists")
	}

	year, month, day := time.Now().Date()

	post := model.CommunityPost{
		ChannelID: input.ChannelID,
		Content:   input.Content,
		Image:     input.Image,
		Like:      input.Like,
		Dislike:   input.Dislike,
		Day:     day,
		Month:   int(month),
		Year:    year,
	}

	_, err2 := r.DB.Model(&post).Insert()

	if err2 != nil {
		return nil, errors.New("Insert failed")
	}

	return &post, nil
}

func (r *mutationResolver) DeleteCommunityPost(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateCommunityPost(ctx context.Context, id string, input *model.NewCommunityPost) (*model.CommunityPost, error) {
	var post model.CommunityPost

	err := r.DB.Model(&post).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Community post doesn't exist")
	}

	post.ChannelID = input.ChannelID
	post.Content = input.Content
	post.Image = input.Image
	post.Like = input.Like
	post.Dislike = input.Dislike

	_, err2 := r.DB.Model(&post).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &post, nil
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
		Duration:      input.Duration,
	}

	_, err2 := r.DB.Model(&video).Insert()

	if err2 != nil {
		fmt.Println(err)
		return nil, errors.New("Insert failed")
	}

	return &video, nil
}

func (r *mutationResolver) UpdateVideo(ctx context.Context, id string, input *model.NewVideo) (*model.Video, error) {
	var video model.Video

	err := r.DB.Model(&video).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Video doesn't exist")
	}

	video.ChannelID = input.ChannelID
	video.Title = input.Title
	video.Description = input.Description
	video.Thumbnail = input.Thumbnail
	video.Category = input.Category
	video.Location = input.Location
	video.View = input.View
	video.Privacy = input.Privacy
	video.IsPremium = input.IsPremium
	video.AgeRestricted = input.AgeRestricted
	video.VideoURL = input.VideoURL
	video.Like = input.Like
	video.Dislike = input.Dislike
	video.Duration = input.Duration

	_, err2 := r.DB.Model(&video).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &video, nil
}

func (r *mutationResolver) DeleteVideo(ctx context.Context, id string) (bool, error) {
	var video model.Video

	err := r.DB.Model(&video).Where("id = ?", id).First()

	if err != nil {
		return false, errors.New("Video not found")
	}

	_, err2 := r.DB.Model(&video).Where("id = ?", id).Delete()

	if err2 != nil {
		return false, errors.New("Delete failed")
	}

	return true, nil
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
		VideoID:          input.VideoID,
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
	var playlist model.Playlist

	err := r.DB.Model(&playlist).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Playlist doesn't exist")
	}

	year, month, day := time.Now().Date()

	playlist.ChannelID = input.ChannelID
	playlist.Title = input.Title
	playlist.Description = input.Description
	playlist.Privacy = input.Privacy
	playlist.Thumbnail = input.Thumbnail
	playlist.LastUpdatedDay = day
	playlist.LastUpdatedMonth = int(month)
	playlist.LastUpdatedYear = year
	playlist.VideoID = input.VideoID

	_, err2 := r.DB.Model(&playlist).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
	}

	return &playlist, nil
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

func (r *mutationResolver) UpdateComment(ctx context.Context, id string, input *model.NewComment) (*model.Comment, error) {
	var comment model.Comment

	err := r.DB.Model(&comment).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Comment doesn't exist")
	}

	comment.VideoID = input.VideoID
	comment.ChannelID = input.ChannelID
	comment.Like = input.Like
	comment.Dislike = input.Dislike
	comment.Content = input.Content

	_, err2 := r.DB.Model(&comment).Where("id = ?", id).Update()

	if err2 != nil {
		return nil, errors.New("Update failed")
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
	var socMed []*model.ChannelSocialMedia

	err := r.DB.Model(&socMed).Where("channel_id = ?", channelID).Order("id").Select()

	if err != nil {
		fmt.Println(err)
		return nil, errors.New("Failed to query social media")
	}

	return socMed, nil
}

func (r *queryResolver) GetUserSubscriptionByUserID(ctx context.Context, userID string) ([]*model.UserSubscription, error) {
	var userSubs []*model.UserSubscription

	err := r.DB.Model(&userSubs).Where("user_id = ?", userID).Select()

	if err != nil {
		fmt.Println(err)
		return nil, errors.New("Failed to query subscription")
	}

	return userSubs, nil
}

func (r *queryResolver) GetUserSubscriptionByUserIDAndChannelID(ctx context.Context, userID string, channelID string) ([]*model.UserSubscription, error) {
	var userSubs []*model.UserSubscription

	err := r.DB.Model(&userSubs).Where("user_id = ? AND channel_id = ?", userID, channelID).First()

	if err != nil {
		return nil, errors.New("Failed to query subscription")
	}

	return userSubs, nil
}

func (r *queryResolver) GetCommunityPostByChannelID(ctx context.Context, channelID string) ([]*model.CommunityPost, error) {
	var post []*model.CommunityPost

	err := r.DB.Model(&post).Where("channel_id = ?", channelID).Order("id desc").Select()

	if err != nil {
		return nil, errors.New("Failed to query community post")
	}

	return post, nil
}

func (r *queryResolver) GetVideoByID(ctx context.Context, id string) ([]*model.Video, error) {
	var video []*model.Video

	err := r.DB.Model(&video).Where("id = ?", id).First()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return video, nil
}

func (r *queryResolver) GetVideoByTitle(ctx context.Context, title string, isRestrict string) ([]*model.Video, error) {
	var videos []*model.Video
	var a string = "false"
	var err error

	var newTitle = "%" + title + "%"

	newTitle = strings.ToLower(newTitle)

	if isRestrict == "false" {
		err = r.DB.Model(&videos).Where("LOWER(title) LIKE ?", newTitle).Select()
	} else {
		err = r.DB.Model(&videos).Where("LOWER(title) LIKE ? AND age_restricted = ?", newTitle, a).Select()
	}

	if err != nil {
		fmt.Println(err)
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetVideoByChannelID(ctx context.Context, channelID string) ([]*model.Video, error) {
	var videos []*model.Video

	err := r.DB.Model(&videos).Where("channel_id = ?", channelID).Order("id desc").Select()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetTrendingVideo(ctx context.Context, isPremium string) ([]*model.Video, error) {
	var videos []*model.Video
	var a = "false"

	var err error

	if isPremium == "true" {
		err = r.DB.Model(&videos).Order("view desc").Select()
	} else {
		err = r.DB.Model(&videos).Where("is_premium = ?", a).Order("view desc").Select()
	}

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetCategoryVideo(ctx context.Context, category string) ([]*model.Video, error) {
	var video []*model.Video

	err := r.DB.Model(&video).Where("category = ?", category).Order("view desc").Select()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return video, nil
}

func (r *queryResolver) GetHomeVideo(ctx context.Context, isRestrict string) ([]*model.Video, error) {
	var videos []*model.Video
	var a string = "false"
	var err error

	if isRestrict == "false" {
		err = r.DB.Model(&videos).Order("id").Select()
	} else {
		err = r.DB.Model(&videos).Where("age_restricted = ?", a).Order("id").Select()
	}

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetRelatedVideo(ctx context.Context, videoID string, category string, isRestrict string) ([]*model.Video, error) {
	var videos []*model.Video
	var a string = "false"
	var err error

	if isRestrict == "false" {
		err = r.DB.Model(&videos).Where("id != ? AND category = ?", videoID, category).Order("id").Select()
	} else {
		err = r.DB.Model(&videos).Where("id != ? AND category = ? AND age_restricted = ?", videoID, category, a).Order("id").Select()
	}

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetVideo(ctx context.Context) ([]*model.Video, error) {
	var videos []*model.Video

	err := r.DB.Model(&videos).Select()

	if err != nil {
		return nil, errors.New("Failed to query video")
	}

	return videos, nil
}

func (r *queryResolver) GetPlaylistByChannelID(ctx context.Context, channelID string) ([]*model.Playlist, error) {
	var playlist []*model.Playlist

	err := r.DB.Model(&playlist).Where("channel_id = ?", channelID).Order("id desc").Select()

	if err != nil {
		return nil, errors.New("Failed to query playlist")
	}

	return playlist, nil
}

func (r *queryResolver) GetPlaylistByUserID(ctx context.Context, userID string) ([]*model.Playlist, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetPlaylistByID(ctx context.Context, id string) ([]*model.Playlist, error) {
	var playlist []*model.Playlist

	err := r.DB.Model(&playlist).Where("id = ?", id).Select()

	if err != nil {
		return nil, errors.New("Failed to query playlist")
	}

	return playlist, nil
}

func (r *queryResolver) GetCommentByVideoID(ctx context.Context, videoID string) ([]*model.Comment, error) {
	var comments []*model.Comment

	err := r.DB.Model(&comments).Where("video_id = ?", videoID).Order("id").Select()

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
