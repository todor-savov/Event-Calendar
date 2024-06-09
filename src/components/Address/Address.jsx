import { STREET_MIN_CHARS, STREET_MAX_CHARS, COUNTRY_MIN_CHARS, COUNTRY_MAX_CHARS, CITY_MIN_CHARS, CITY_MAX_CHARS} from '../../common/constants';
import './Address.css';

const Address = () => {

    return (
        <>
            <span className="address">
                <input type="text" name="country" id="country" placeholder="Country" required />
                <span><i>{COUNTRY_MIN_CHARS}-{COUNTRY_MAX_CHARS} chars | upper-/lowercase | space</i></span>

                <input type="text" name="city" id="city" placeholder="City" required />
                <span><i>{CITY_MIN_CHARS}-{CITY_MAX_CHARS} chars | upper-/lowercase | space</i></span>

                <input type="text" name="street" id="street" placeholder="Street" />
                <span><i>{STREET_MIN_CHARS}-{STREET_MAX_CHARS} chars | upper-/lowercase | digits | space | dot</i></span>
            </span>
        </>
    )
}

export default Address;