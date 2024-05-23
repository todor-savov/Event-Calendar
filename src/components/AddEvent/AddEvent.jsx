import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { addEvent, getUserContactLists, getUserDetails } from '../../service/database-service';
import './AddEvent.css';

const AddEvent = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const [contactsWithPhoto, setContactsWithPhoto] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [form, setForm] = useState({
        author: '', title: '', description: '', 
        startDate: '', startTime: '', endDate: '', endTime: '', 
        visibility: '', invitedUsers: [], canInvite: false, 
        locationType: '', location: '', type: 'single'
    });
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getContacts = async () => {
            try {
                setLoading(true);
                const contactLists = await getUserContactLists(isLoggedIn.user);
                const allContacts = Object.values(contactLists)
                                .map(contactList => contactList.contacts)
                                .flat()
                                .filter(contact => contact !== undefined);

                const usersWithPhotos = allContacts.map(async contact => {
                    const usersWithThisEmail = await getUserDetails(contact);
                    if (usersWithThisEmail[0].photo) {
                        return { email: contact, photo: usersWithThisEmail[0].photo };
                    } else {
                        return { email: contact, photo: '' };
                    }
                });

                const contactsWithPhotos = await Promise.all(usersWithPhotos);
                setContactsWithPhoto(contactsWithPhotos);

                const currentUserDetails = await getUserDetails(isLoggedIn.user);
                setInvitedUsers([...invitedUsers, {email: isLoggedIn.user, photo: currentUserDetails[0].photo}]);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error.message);
            }
        }
        getContacts();
    }, []);

    useEffect(() => {
        const handleAddEvent = async () => {
            console.log(form);
            try {
                setLoading(true);
                await addEvent(form);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error.message);
            }
        }
        if (isFormSubmitted) handleAddEvent();
    }, [form]);

    const handleSingleEventTabClick = () => {
        console.log('Single Event Tab Clicked');
    }

    const handleSeriesEventTabClick = () => {
        console.log('Series Event Tab Clicked');
    }

    const formSubmit = (event) => {
        event.preventDefault();
        const author = isLoggedIn.user;
        const title = event.target.title.value;
        const description = event.target.description.value;
        const startDate = event.target.startDate.value;
        const startTime = event.target.startTime.value;
        const endDate = event.target.endDate.value;
        const endTime = event.target.endTime.value;
        const visibility = event.target.visibility.value;
        const canInvite = event.target.canInvite.checked;
        const locationType = event.target.locationType.value;
        const location = event.target.location.value;
        const type = "single";

        setForm({author, title, description, startDate, startTime, endDate, endTime, 
                visibility, invitedUsers, canInvite, locationType, location, type});
        
        setIsFormSubmitted(true);
    }

    const handleInviteChange = (event) => {
        setInputValue(event.target.value);
        const emailInput = event.target.value;
        const filteredContacts = contactsWithPhoto.filter(contact => contact.email.includes(emailInput));        
        if (filteredContacts.length === 0 || emailInput === '') {
            setSuggestions([]);
        } else {
            setSuggestions(filteredContacts);
        }
    }

    const handleSuggestionClick = (suggestion) => {
        const isUserAlreadyInvited = invitedUsers.find(user => user.email === suggestion.email);
        if (!isUserAlreadyInvited) {
            setInvitedUsers([...invitedUsers, suggestion]);
        }
        setInputValue('');
        setSuggestions([]);
    }

    if (loading) {
        return (
            <div className='spinner'></div>
        )
    }

    return (
        <>  
            <h1>Add Event</h1>
            {error && <p className="error">{error}</p>}
            <div role="tablist" className="tabs tabs-lifted">
                <a role="tab" className="tab tab-active" onClick={handleSingleEventTabClick}>Single</a>
                <a role="tab" className="tab" onClick={handleSeriesEventTabClick}>Series</a>
            </div>

            <form onSubmit={formSubmit} onClick={() => setSuggestions([])} className="event-form">
                <label htmlFor="title" className="required"> Title </label>
                <input type="text" id="title" name="title" className="common" required />
                <br />
                <br />

                <textarea id="description" name="description" className="common" placeholder="Description"></textarea>
                <br />
                <br />

                <label htmlFor="startDate" className="required"> Start Date </label>
                <input type="date" id="startDate" name="startDate" className="common" required/>

                <label htmlFor="startTime" className="required"> Hour </label>
                <input type="time" id="startTime" name="startTime" className="common" required/>
                <br />
                <br />

                <label htmlFor="endDate" className="required"> End Date </label>
                <input type="date" id="endDate" name="endDate" className="common" required/>

                <label htmlFor="endTime" className="required"> Hour </label>
                <input type="time" id="endTime" name="endTime" className="common" required/>
                <br />
                <br />

                <span>  
                        <label htmlFor="visibility" className="required"> Visibility </label>
                        <select name="visibility" id="visibility" className="common" required>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>

                        <label htmlFor="canInvite" className="required">
                            Allow invited users to invite others 
                        <input type="checkbox" id="canInvite" name="canInvite" className="common" required />
                        </label>
                </span>
                <br />
                <br />

                <div className="email-suggestion-container">
                    <label htmlFor="invitedUsers"> Invited Users </label>
                    <input type="text" 
                        id="invitedUsers" 
                        name="invitedUsers" 
                        value={inputValue}
                        placeholder="Type an email address" 
                        onChange={handleInviteChange} 
                        className="common"
                    />
                    {suggestions.length ? 
                        <div className="suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} 
                                    className="suggestion-item" 
                                    onClick={() => handleSuggestionClick(suggestion)}>
                                    <img src={suggestion.photo} alt="" /> {suggestion.email}
                                </div>
                            ))}
                        </div>
                        : null
                    }
                </div>
                {invitedUsers.length ?  
                    <div className="invited-users">
                        {invitedUsers.map((user, index) => (
                            <div key={index} className="invited-user">
                                <img src={user.photo} alt="" /> <span>{user.email}</span>
                            </div>
                        ))}
                    </div>
                    : null
                }
                <br />

                <label htmlFor="locationType" className="required"> Location Type </label>
                <select name="locationType" id="locationType" className="common" required >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>
                
                <label htmlFor="location" className="required"> Location </label>
                <input type="text" name="location" id="location" className="common" required />
                <br />
                <br />

                <label htmlFor="upload"> Upload Image </label>
                <input type="file" name="upload" id="upload" className="formbold-form-file" />
                <br />
                <br />

                <button type="submit" className="formbold-btn">Add event</button>
            </form>
        </>
       
    )
}

export default AddEvent;