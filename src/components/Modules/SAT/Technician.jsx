import React from 'react';
import { isMobile } from "react-device-detect";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@material-ui/core";
import jwt_decode from 'jwt-decode';
import { gql } from "apollo-boost";
import { useSubscription } from "@apollo/react-hooks";
import PerfectScrollbar from "react-perfect-scrollbar";
import { TranslatorContext } from "../../../contextProviders/Translator";
import { formatDate } from '../../../utils/format';
import loadingWhiteSVG from "../../../assets/loading_white.svg";
import PartsMap from './PartsMap';
import { primary } from '../../../styles/colors';
import NotFound from '../../Segments/NotFound';

const PARTS_SUBSCRIPTION = gql`
  subscription partAdded($employeeId: Int!) {
    partAdded(employeeId: $employeeId) {
        id
        partId
        date
        address
        reason
        type {
            mounting
            maintenance
            repair
            others
        }
        finished
        notFinishedReason
        employeeId
        customerId
        customer{
            id
            name
        }
    }
  }
`;

const PART_UPDATED_SUBSCRIPTION = gql`
  subscription partUpdated($employeeId: Int!) {
    partUpdated(employeeId: $employeeId) {
        id
        partId
        date
        address
        reason
        type {
            mounting
            maintenance
            repair
            others
        }
        finished
        notFinishedReason
        employeeId
        customerId
        customer{
            id
            name
        }
    }
  }
`;

const PartsList = ({parts, distances, onScrollYReachEnd, translations, handleOpen, loadingMore}) => {
    let renderParts = [...parts];
    if(distances && distances.length > 0){
        for (let index = 0; index < renderParts.length; index++) {
            renderParts[index].distance = distances[index];
        }
    }

    return (
        <React.Fragment>
            {(renderParts.length > 0) ?
                    <PerfectScrollbar
                        onYReachEnd={onScrollYReachEnd}
                        style={{ width: "100%" }}
                        options={{
                            suppressScrollX: true
                        }}
                    >
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        align="center"
                                    >
                                        {translations.customer}
                                    </TableCell>
                                    {!isMobile &&
                                        <TableCell
                                            align="center"
                                        >
                                            {translations.date}
                                        </TableCell>
                                    }
                                    <TableCell
                                        align="center"
                                    >
                                        {translations.reason}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                    >
                                        KM
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                    >
                                        <i className="fas fa-clipboard-check"></i>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderParts.map(part => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={part.id}
                                        onClick={() => {handleOpen(part)}}
                                    >
                                        <TableCell align="center">
                                            {part.customer.name}
                                        </TableCell>
                                        {!isMobile &&
                                            <TableCell align="center">
                                                {formatDate(part.date)}
                                            </TableCell>
                                        }
                                        <TableCell align="center">
                                            {part.reason}
                                        </TableCell>
                                        <TableCell align="center">
                                            {part.distance}
                                        </TableCell>
                                        <TableCell align="center">
                                                {part.finished &&
                                                    <i className="fas fa-check" style={{color: primary}}></i>
                                                }
                                            </TableCell>
                                    </TableRow>
                                ))}
                                {loadingMore && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginTop: "5px"
                                        }}
                                    >
                                        <img
                                            src={loadingWhiteSVG}
                                            alt="loadingIcon"
                                            style={{ maxWidth: "80px" }}
                                        />
                                    </div>
                                )}
                            </TableBody>
                        </Table>
                    </PerfectScrollbar>
                :
                    <NotFound />
            }
        </React.Fragment>
    )
}

const Technician = ({tab, parts: dbParts, handleOpen, loadingMore, onScrollYReachEnd}) => {
     const token = sessionStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    const mapContainer = React.useRef();
    const { translations } = React.useContext(TranslatorContext);
    const [me] = React.useState(decodedToken.employee);
    const [mapHeight, setMapHeight] = React.useState(400);
    const [distances, setDistances] = React.useState();
    const [parts, setParts] = React.useState([]);
    const [subscriptionParts, setSubscriptionParts] = React.useState([]);
    const { data: dataPartAdded } = useSubscription(PARTS_SUBSCRIPTION, { variables: { employeeId: me.id } });
    const { data: dataPartUpdated } = useSubscription(PART_UPDATED_SUBSCRIPTION, { variables: { employeeId: me.id } });

    React.useEffect(() => {
        if(!!mapContainer && !!mapContainer.current && !!mapContainer.current.clientHeight) setMapHeight(mapContainer.current.clientHeight);
    },[mapContainer])

    const reduceParts = (newParts) => {
        let uniqueParts = [];

        for (let index = (newParts.length - 1); index >= 0; index--) {
            let exists = false;
            uniqueParts.forEach(uniquePart => {
                if(uniquePart.id === newParts[index].id) exists = true;
            });
            if(!exists) uniqueParts.push(newParts[index]);
        }

        return uniqueParts;

        /* let uniqueParts = newParts.reduce((unique, item, index) => {
            return unique.includes(item) ? unique : [...unique, item]
        },[]);

        console.info('UNIQUE PARTS', uniqueParts);
        return uniqueParts; */
    }

    const getUpdateParts = (apolloParts, subsParts) => {
        let updatedParts = [...apolloParts];
        if(subsParts.length > 0){
            for (let index = (subsParts.length - 1); index >= 0; index--) {
                const subsPart = subsParts[index];
                updatedParts.unshift(subsPart);
            }
        }
        return updatedParts;
    }

    React.useEffect(() => {
        if(!!dbParts){
            const newParts = getUpdateParts(dbParts, subscriptionParts);
            const reducedParts = reduceParts(newParts);
            setParts(reducedParts);
        }
    },[dbParts])

    React.useEffect(() => {
        if(!!dataPartAdded && !!dataPartAdded.partAdded && dataPartAdded.partAdded !== undefined){
            const newSubsParts = [...subscriptionParts];
            newSubsParts.unshift(dataPartAdded.partAdded);

            const newParts = getUpdateParts(dbParts, newSubsParts);
            const reducedParts = reduceParts(newParts);
            setParts(reducedParts);
            setSubscriptionParts(newSubsParts);
        }
    },[dataPartAdded])

    React.useEffect(() => {
        if(!!dataPartUpdated && !!dataPartUpdated.partUpdated && dataPartUpdated.partUpdated !== undefined){
            let newParts = [];

            parts.forEach(part => {
                if(part.id === dataPartUpdated.partUpdated.id){
                    newParts.push(dataPartUpdated.partUpdated)
                } 
                else{
                    newParts.push(part);
                }
            });

            const reducedParts = reduceParts(newParts);
            setParts(reducedParts);
        }
    },[dataPartUpdated])

    return (
        <div
            ref={mapContainer}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex'
            }}
        >
            {isMobile ?
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex'
                        }}
                    >
                        {tab === 'parts' ?
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex'
                                    }}
                                >
                                    <PartsList 
                                        parts={parts}
                                        distances={distances}
                                        onScrollYReachEnd={onScrollYReachEnd}
                                        translations={translations}
                                        handleOpen={handleOpen}
                                        loadingMore={loadingMore}
                                    />
                                </div>
                            :
                                <PartsMap 
                                    height={mapHeight}
                                    parts={parts}
                                    setDistances={setDistances}
                                />
                        }
                    </div>
                :
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <div
                            style={{
                                width: '50%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px'
                            }}
                        >
                            <PartsList 
                                parts={parts}
                                distances={distances}
                                onScrollYReachEnd={onScrollYReachEnd}
                                translations={translations}
                                handleOpen={handleOpen}
                                loadingMore={loadingMore}
                            />
                        </div>

                        <div
                            style={{
                                width: '50%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px'
                            }}
                        >
                            <PartsMap 
                                height={(mapHeight - 40)}
                                parts={parts}
                                setDistances={setDistances}
                            />
                        </div>
                    </div>
            }
        </div>
    )
}

export default Technician;