var adBadge = <div className="ad-badge">Ad</div>;

<a className={"test"} target="_blank" onClick={function() {"do something"}} href={"href"}>
    <div className="inner">
        {adBadge}
        <div className="card-header">
            <div className="inner">
                <h5 className="carrier-title">
                    <div className="carrier-link">{true ? 'Metromile' : 'EverQuote'}</div>
                </h5>
            </div>
        </div>
        <div className="rate show">
            <span onClick={something => something} className="dolla-dolla-bill">$</span><span className="rate-value">{true ? 39 : 29}</span>
            <span onClick={truth => truth} styles={{color: 'black', height: 10}} className="rate-tag">{true ? '+ 5¢ per mile' : 'and up'}</span>
        </div>
    </div>
</a>
